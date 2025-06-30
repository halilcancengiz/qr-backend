import responseHelper from '../helpers/responseHelper.js';

export const verifySecretKey = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== process.env.SECRET_KEY) {
      return responseHelper(res, 401, "Geçersiz veya eksik API anahtarı");
    }

    next(); // key doğruysa devam et
  } catch (error) {
    console.error('Error in verifySecretKey middleware:', error);
    return responseHelper(res, 500, "Sunucu hatası");
  }
};