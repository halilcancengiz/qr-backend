import nodemailer from "nodemailer";


const imagePath = "./public/assets/logo.png";


const sendVerificationEmail = async (to, verifyToken) => {
    try {
        // 1️⃣ E-posta gönderimi için SMTP ayarlarını yap
        const transporter = nodemailer.createTransport({
            service: "gmail", // Gmail kullanıyorsanız
            auth: {
                user: process.env.EMAIL_USER, // Gönderen e-posta adresi (örneğin: noreply@domain.com)
                pass: process.env.EMAIL_PASS, // E-posta şifresi veya uygulama şifresi
            },
            tls: {
                rejectUnauthorized: false, // Güvenlik sertifikası doğrulaması için TLS kullanma (bazı durumlarda gerekebilir)
            },
        });



        let htmlContent = `
        <div style="max-width: 400px; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); text-align: center;">
         <img src="cid:uniqueLogo" alt="Logo" width="75" height="auto" style="margin-bottom: 10px;"/>
         <p style="color: #333; font-size: 14px; line-height: 1.5;">
             We received a request to verify your email address. To activate your account, please verify your email address. Click the button below to complete the verification process.
         </p>
         <p style="color: #555; font-size: 12px; line-height: 1.5;">
             This link will be valid for <b>1 hour</b> only. If you do not verify your email within this time frame, you will need to request a new verification link.
         </p>
         <p style="color: #777; font-size: 12px;">
             If you did not make this request, there is no need to worry. Your account remains secure, and no action will be taken.
         </p>
         <p style="color: #777; font-size: 12px;">
             If you encounter any issues or need assistance, feel free to reach out to us.
         </p>
         <a href="${process.env.CLIENT_URL}/verify-email/${verifyToken}" style="display: inline-block; background-color:rgba(0, 0, 0, 0.84); color: white; padding: 10px 20px; text-align: center; text-decoration: none; border-radius: 5px; font-size: 14px; font-weight: bold; margin-top: 10px;">
             Verify Your Email Address
         </a>
         <p style="margin-top: 20px; color: #333; font-size: 14px;"><b>Thank You</b></p>
         <p style="color: #555; font-size: 12px;"><b>Support Team</b></p>
     </div>
     `
        let from = `QR Support ${process.env.EMAIL_USER}`

        const mailOptions = {
            from,
            to,
            subject: "Activate Your Account",
            html: htmlContent,
            attachments: [
                {
                    filename: "logo.png",
                    path: imagePath,
                    cid: "uniqueLogo",
                },
            ],
        };

        // 3️⃣ E-posta gönder
        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Email send error:", error.message); // Daha ayrıntılı hata mesajı
        if (error.response) {
            console.error("SMTP Response:", error.response); // SMTP sunucusundan gelen yanıtı göster
        }
        return false;
    }
};

export default sendVerificationEmail;
