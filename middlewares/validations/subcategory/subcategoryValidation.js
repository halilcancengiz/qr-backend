import { body } from "express-validator";
import mongoose from "mongoose";

export const createSubcategoryValidation = [
    body("name")
        .notEmpty()
        .withMessage("Subcategory name is required.")
        .isString()
        .withMessage("Subcategory name must be a string."),
];

export const updateSubcategoryValidation = [
    body("subcategoryId")
        .notEmpty()
        .withMessage("Subcategory ID is required.")
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error("Invalid category ID.");
            }
            return true;
        }),

    body("name")
        .optional()
        .isString()
        .withMessage("Subcategory name must be a string."),

    body("isVisible")
        .optional()
        .isBoolean()
        .withMessage("isVisible must be a boolean (true or false)."),
];

export const deleteSubcategoryValidation = [
    body("subcategoryId")
        .notEmpty()
        .withMessage("Subcategory ID is required.")
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error("Invalid subcategory ID.");
            }
            return true;
        }),
];

export const getSubcategoryByIdValidation = [
    body("subcategoryId")
        .notEmpty()
        .withMessage("Subcategory ID is required.")
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error("Invalid subcategory ID.");
            }
            return true;
        }),
];
