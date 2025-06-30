import { body } from "express-validator";
import mongoose from "mongoose";

export const createCategoryValidation = [
    body("name")
        .notEmpty()
        .withMessage("Category name is required.")
        .isString()
        .withMessage("Category name must be a string."),

    body("image")
        .optional()
        .custom((value, { req }) => {
            if (!req.file) return true; 
            const fileSize = req.file.size;
            const maxSize = 10 * 1024 * 1024;
            if (fileSize > maxSize) {
                throw new Error("Image must be less than 10MB.");
            }
            return true;
        }),
];

export const updateCategoryValidation = [
    body("categoryId")
      .notEmpty()
      .withMessage("Category ID is required.")
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Invalid category ID.");
        }
        return true;
      }),
  
    body("name")
      .optional()
      .isString()
      .withMessage("Category name must be a string.")
      .trim()
      .notEmpty()
      .withMessage("Category name cannot be empty."),
  
    body("image") // burada body'den değil, `req.file`'dan kontrol ediyoruz
      .custom((_, { req }) => {
        if (!req.file) return true; // dosya gönderilmediyse sorun yok
        const fileSize = req.file.size;
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (fileSize > maxSize) {
          throw new Error("Image must be less than 10MB.");
        }
        return true;
      }),
  
    body("isVisible")
      .optional()
      .isBoolean()
      .withMessage("isVisible must be a boolean (true or false)."),
  ];

export const deleteCategoryValidation = [
    body("categoryId")
        .notEmpty()
        .withMessage("Category ID is required.")
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error("Invalid category ID.");
            }
            return true;
        }),
];
