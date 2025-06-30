import jwt from 'jsonwebtoken';
import responseHelper from '../helpers/responseHelper.js';

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return responseHelper(res, 401, "Unauthenticated");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return responseHelper(res, 401, "Unauthenticated");
      }

      req.user = decoded; // decoded objede userId, email vs. varsa direkt buraya atanır
      next();
    });

  } catch (error) {
    console.error('Error in verifyToken middleware:', error);
    return responseHelper(res, 500, "Unauthenticated");
  }
};