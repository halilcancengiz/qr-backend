// controllers/authController.js
import User from "../models/user.model.js"  // User modelini dahil ediyoruz
import bcrypt from "bcrypt";        // Şifreyi hashlemek için
import responseHelper from "../helpers/responseHelper.js" // responseHelper fonksiyonunu dahil ediyoruz
import jwt from 'jsonwebtoken';
import sendVerificationEmail from "../utils/emails/sendVerificationEmail.js";
import sendForgotPasswordEmail from "../utils/emails/sendResetPasswordEmail.js";
import crypto from 'crypto-js';
import { getUserIdFromToken } from "../utils/getUserIdFromToken.js";


export const generateVerifyToken = (user) => {
  const token = jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  user.emailVerificationToken = token;
  user.emailVerificationExpires = Date.now() + 3600000; // 1 saat geçerlilik
  return token;
};

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. E-posta zaten kayıtlı mı?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return responseHelper(res, 409, "This email is already registered.");
    }

    // 2. Şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Yeni kullanıcıyı oluştur
    const newUser = new User({ email, password: hashedPassword });

    // 4. Token oluştur ve kullanıcıya ekle
    const verifyToken = generateVerifyToken(newUser);

    // 5. Kullanıcıyı kaydet
    await newUser.save();

    // 6. Mail gönder
    await sendVerificationEmail(email, verifyToken);

    // 7. Başarılı cevap gönder
    return responseHelper(
      res,
      201,
      "Registration successful. A confirmation email has been sent to your email address. Please follow the instructions in the email to verify your account.",
      { userId: newUser._id }
    );

  } catch (error) {
    console.error("Error during registration:", error);
    return responseHelper(res, 500, "Server error, please try again later");
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return responseHelper(res, 400, 'This email is not registered.');

    if (!user.isVerified) {
      if (!user.emailVerificationToken || user.emailVerificationExpires < Date.now()) {
        const token = generateVerifyToken(user);
        await user.save();
        await sendVerificationEmail(user.email, token);
        return responseHelper(res, 400, 'Your email is not verified. A new verification email has been sent.');
      }

      return responseHelper(res, 400, 'Your email is not verified. Please verify your email.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return responseHelper(res, 400, 'Email or password is incorrect.');
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      // { expiresIn: '1h' }
      { expiresIn: '4w' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000,
    });

    return responseHelper(res, 200, 'Login successful!', { userId: user._id });

  } catch (error) {
    console.error('Error during login:', error);
    return responseHelper(res, 500, 'Server error, please try again later.');
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return responseHelper(res, 200, "Logout successful!");
  } catch (error) {
    console.error("Error during logout:", error);
    return responseHelper(res, 500, "Server error, please try again later.");
  }
}

export const verifyAccount = async (req, res) => {
  try {
    const { emailVerificationToken } = req.body;

    // Token kontrolü: Eğer token yoksa hata döndür
    if (!emailVerificationToken) {
      return responseHelper(res, 400, "Email verification token is required.");
    }

    // Token'ı doğrula
    let decoded;
    try {
      decoded = jwt.verify(emailVerificationToken, process.env.JWT_SECRET);
    } catch (error) {
      return responseHelper(res, 400, "Invalid or expired email verification token.");
    }

    // Token doğrulandıktan sonra email bilgisini kontrol et
    if (!decoded || !decoded.email) {
      return responseHelper(res, 400, "Invalid email verification token.");
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return responseHelper(res, 404, "Account not found.");
    }

    if (user.isVerified) {
      return responseHelper(res, 400, "Account is already verified.");
    }

    // Hesabı doğrula
    user.isVerified = true;
    user.emailVerificationToken = null; // Doğrulama token'ını temizle
    await user.save();

    return responseHelper(res, 200, "Account successfully verified.");
  } catch (error) {
    console.error("Error during account verification:", error);
    return responseHelper(res, 500, "Server error, please try again later.");
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Kullanıcıyı email ile bul
    const user = await User.findOne({ email });
    if (!user) {
      return responseHelper(res, 400, "This email is not registered.");
    }

    // Kullanıcının e-posta adresi doğrulanmış mı?
    if (user.isVerified) {
      return responseHelper(res, 400, "Your email is already verified.");
    }

    // Doğrulama token'ını yeniden oluştur
    const verifyToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token süresi
    );

    // Doğrulama e-postasını yeniden gönder
    await sendVerificationEmail(user.email, verifyToken);

    return responseHelper(res, 200, "Verification email resent successfully.");
  } catch (error) {
    console.error("Error during resend verification:", error);
    return responseHelper(res, 500, "Server error, please try again later.");
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const userId = req.user.userId;

    // Kullanıcıyı veritabanından bul
    const user = await User.findById(userId);
    if (!user) {
      return responseHelper(res, 404, "User not found.");
    }

    // Mevcut şifre doğru mu?
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return responseHelper(res, 400, "Old password is incorrect.");
    }

    // Aynı şifre kontrolü
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return responseHelper(res, 400, "New password must be different from the current password.");
    }

    // Yeni şifreyi hash'le
    user.password = await bcrypt.hash(newPassword, 10);

    // Kaydet
    await user.save();

    return responseHelper(res, 200, "Password changed successfully.");
  } catch (error) {
    console.error("Error during password change:", error);
    return responseHelper(res, 500, "Server error, please try again later.");
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return responseHelper(res, 404, 'No user found with this email.');
    }

    // Şifre sıfırlama token'ını oluştur
    const resetToken = crypto.lib.WordArray.random(32).toString(crypto.enc.Hex); // Token'ı oluştur
    const resetTokenHash = crypto.SHA256(resetToken).toString(crypto.enc.Hex); // Token'ı hash'le

    // Token'ı kullanıcıya kaydet ve token süresini ayarla (1 saat geçerli)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 saat geçerli
    await user.save();

    // Şifre sıfırlama linki
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // sendForgotPasswordEmail fonksiyonunu kullanarak e-posta gönder
    await sendForgotPasswordEmail(email, 'Password Reset Request', resetUrl);

    return responseHelper(res, 200, 'Password reset link has been sent to your email.');
  } catch (error) {
    console.error('Forgot password error:', error);
    return responseHelper(res, 500, 'Server error. Please try again later.');
  }
};

// resetPassword fonksiyonu
export const resetPassword = async (req, res) => {
  try {
    const { newPassword, resetPasswordToken } = req.body;

    // 1. Adım: Token'ı hash'leyip veritabanı ile karşılaştırıyoruz
    const resetTokenHash = crypto.SHA256(resetPasswordToken).toString(crypto.enc.Hex);

    // 2. Adım: Veritabanında kullanıcıyı bulma
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash, // Hash'li token ile karşılaştırma
      resetPasswordExpires: { $gt: Date.now() },  // Token'ın süresi dolmamış olmalı
    });

    if (!user) {
      console.error('User not found or token expired');
      return responseHelper(res, 404, 'Invalid or expired reset password token.');
    }

    // 3. Adım: Yeni şifreyi hash'leme
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // 4. Adım: Şifre sıfırlama token'ını temizleme
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // 5. Adım: Kullanıcıyı güncelleme
    await user.save();

    return responseHelper(res, 200, 'Password reset successfully.');
  } catch (error) {
    console.error('Error during password reset:', error);
    return responseHelper(res, 500, 'Server error. Please try again later.');
  }
};

export const getCurrentUser = async (req, res) => {

  try {
    const token = req.cookies.token;
    const userId = getUserIdFromToken(token)

    return responseHelper(res, 200, "Authenticated" );
  } catch (error) {
    return responseHelper(res, 400, "Unauthenticated ");
  }
};