import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import upload from '../middlewares/upload.js';
import { createCategoryValidation, deleteCategoryValidation, updateCategoryValidation } from '../middlewares/validations/category/categoryValidation.js';
import { validationHelper } from '../helpers/validationHelper.js';
import { createCategory, deleteCategory, getAllCategoriesWithProducts, getAllCategoryList, getCategoryById, updateCategory } from '../controllers/category.controller.js';


const categoryRouter = express.Router();

categoryRouter.post('/create', verifyToken, upload.single('image'), createCategoryValidation, validationHelper, createCategory);
categoryRouter.post('/update', verifyToken, upload.single('image'), updateCategoryValidation, validationHelper, updateCategory);
categoryRouter.delete('/delete', verifyToken, deleteCategoryValidation, validationHelper, deleteCategory);
categoryRouter.get('/getById', verifyToken, getCategoryById);
categoryRouter.get('/getAllCategoriesWithProducts', verifyToken, getAllCategoriesWithProducts);
categoryRouter.get('/getAllCategoryList', verifyToken, getAllCategoryList);



export default categoryRouter;