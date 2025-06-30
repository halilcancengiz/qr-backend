import { query } from 'express-validator';

export const generalQueryFiltersValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer.'),

    query('limit')
        .optional()
        .isInt({ min: 1 }).withMessage('Limit must be a positive integer.'),

    query('sortField')
        .optional()
        .isString().withMessage('Sort field must be a string.'),

    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc']).withMessage('Sort order must be "asc" or "desc".'),

    query('isVisible')
        .optional()
        .isIn(['true', 'false']).withMessage('isVisible must be "true" or "false".'),

    query('search')
        .optional()
        .isString().withMessage('Search must be a string.'),
];