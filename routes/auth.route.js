import express from 'express';
import { register, login, logout, verifyAccount, resendVerificationEmail, changePassword, resetPassword, forgotPassword, getCurrentUser } from '../controllers/auth.controller.js';
import { validationHelper } from '../helpers/validationHelper.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { changePasswordValidation, forgotPasswordValidation, loginValidation, registerValidation, resetPasswordValidation } from '../middlewares/validations/auth/authValidation.js';

const authRouter = express.Router();

authRouter.get('/me', verifyToken, getCurrentUser);
authRouter.post('/register', registerValidation, validationHelper, register);
authRouter.post('/login', loginValidation, validationHelper, login);
authRouter.post('/logout', logout);
authRouter.post('/verify-email', verifyAccount);
authRouter.post('/resend-verify-email', resendVerificationEmail);
authRouter.post('/change-password', verifyToken, changePasswordValidation, validationHelper, changePassword);
authRouter.post('/reset-password', resetPasswordValidation, validationHelper, resetPassword);
authRouter.post('/forgot-password', forgotPasswordValidation, validationHelper, forgotPassword);

export default authRouter;