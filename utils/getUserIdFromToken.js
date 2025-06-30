import jwt from 'jsonwebtoken';

/**
 * Token'dan userId'yi çıkarır.
 * @param {string} token - Cookie'den alınan JWT token
 * @returns {string|null} - User ID veya null (geçersiz token)
 */
export const getUserIdFromToken = (token) => {
  try {
    // Token'ı doğrula ve çözümlenmiş veriyi al
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT_SECRET_KEY ortam değişkeni kullanılmalı
    return decoded.userId;  // Token'dan userId'yi al
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return null;  // Geçersiz token durumunda null döndür
  }
};