import { validationResult } from 'express-validator';
import responseHelper from '../helpers/responseHelper.js';
import { deleteImageWhileOnError } from './deleteUploadedImageOnError.js';

export const validationHelper = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstErrorMessage = errors.array()[0].msg;
        if (req.file) {
            deleteImageWhileOnError(req.file.path); // Delete the uploaded image if validation fails
        }
        return responseHelper(res, 400, firstErrorMessage);
    }
    next();
}
