import { body, query } from "express-validator";
import mongoose from "mongoose";

const allergenEnum = [
  'gluten',
  'crustaceans',
  'eggs',
  'fish',
  'peanuts',
  'soybeans',
  'milk',
  'tree_nuts',
  'celery',
  'mustard',
  'sesame',
  'sulphites',
  'lentils',
  'molluscs',
];

export const createProductValidation = [
  body("categoryId")
    .notEmpty().withMessage("Category ID is required.")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid Category ID.");
      }
      return true;
    }),

  body("name")
    .notEmpty().withMessage("Product name is required.")
    .isString().withMessage("Product name must be a string."),

  body("description")
    .optional()
    .isString().withMessage("Description must be a string."),

  body("price")
    .notEmpty().withMessage("Price is required.")
    .isFloat({ gt: 0 }).withMessage("Price must be a number greater than 0."),

  body("currency")
    .notEmpty().withMessage("Currency is required.")
    .isIn(["TRY", "USD", "EUR"]).withMessage("Currency must be TRY, USD, or EUR."),

  body("allergens")
    .optional()
    .toArray()
    .custom((value) => {
      if (!Array.isArray(value)) throw new Error("Allergens must be an array.");
      const allStrings = value.every(item => typeof item === "string");
      if (!allStrings) throw new Error("Each allergen must be a string.");
      return true;
    }),
  body("preparationTime")
    .optional()
    .isFloat({ gt: 0 }).withMessage("Preparation time must be a number greater than 0."),

  body("sortOrder")
    .optional()
    .isInt({ min: 1 }).withMessage("Sort order must be an integer greater than 0."),

];

export const updateProductValidation = [
  body("productId")
    .notEmpty().withMessage("Product ID is required.")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid Product ID.");
      }
      return true;
    }),

  body("name")
    .optional()
    .isString().withMessage("Product name must be a string."),

  body("description")
    .optional()
    .isString().withMessage("Description must be a string."),

  body("price")
    .optional()
    .isFloat({ gt: 0 }).withMessage("Price must be a number greater than 0."),

  body("currency")
    .optional()
    .isIn(["TRY", "USD", "EUR"]).withMessage("Currency must be TRY, USD, or EUR."),

  body("allergens")
    .optional()
    .toArray()
    .custom((value) => {
      if (!Array.isArray(value)) throw new Error("Allergens must be an array.");
      const allStrings = value.every(item => typeof item === "string");
      if (!allStrings) throw new Error("Each allergen must be a string.");
      return true;
    }),
  body("preparationTime")
    .optional()
    .isFloat({ gt: 0 }).withMessage("Preparation time must be a number greater than 0."),

  body("isVisible")
    .optional()
    .isBoolean().withMessage("isVisible must be true or false.")
];

export const deleteProductValidation = [
  body("productId")
    .notEmpty().withMessage("Product ID is required.")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid Product ID.");
      }
      return true;
    }),
];

export const getProductByIdValidation = [
  query("productId")
    .notEmpty().withMessage("Product ID is required.")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid Product ID.");
      }
      return true;
    }),
];

