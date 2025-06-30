import { body } from 'express-validator';


export const registerValidation = [
    body('email')
        .notEmpty().withMessage('E-mail field is required!')
        .isEmail().withMessage('Please enter a valid e-mail address.')
        .normalizeEmail()
        .trim(),
    body('password')
        .notEmpty().withMessage('Password field is required!')
        .matches(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[\W_]).{6,}$/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.')
        .trim(),
];

export const loginValidation = [
    body('email')
        .notEmpty().withMessage('E-posta field is required!')
        .isEmail().withMessage('Please enter a valid e-mail address.')
        .normalizeEmail()
        .trim(),
    body('password')
        .notEmpty().withMessage('Password field is required!')
        .trim()
];

export const changePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('Current password field is required!')
        .trim(),
    body('newPassword')
        .notEmpty().withMessage('New password field is required!')
        .matches(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[\W_]).{6,}$/).withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number and one special character.')
        .trim()
];

export const forgotPasswordValidation = [
    body('email')
        .notEmpty().withMessage('E-posta field is required!')
        .isEmail().withMessage('Please enter a valid e-mail address.')
        .normalizeEmail()
        .trim(),
];


export const resetPasswordValidation = [
    body('resetPasswordToken')
        .notEmpty().withMessage('Reset password token field is required!')
        .trim(),
    body('newPassword')
        .notEmpty().withMessage('Password field is required!')
        .matches(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[\W_]).{6,}$/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.')
        .trim()
];

