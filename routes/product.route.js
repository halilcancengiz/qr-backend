import express from 'express';
import upload from '../middlewares/upload.js';
import { createProductValidation, deleteProductValidation, getProductByIdValidation, updateProductValidation } from '../middlewares/validations/product/productValidation.js';
import { validationHelper } from '../helpers/validationHelper.js';
import { createProduct, deleteProduct, getAllProductsByUser, getProductById, updateProduct } from '../controllers/product.controller.js';
import { verifyToken } from "../middlewares/verifyToken.js"



const productRouter = express.Router();

productRouter.post('/create', verifyToken, upload.single('image'), createProductValidation, validationHelper, createProduct);
productRouter.post('/update', verifyToken, upload.single('image'), updateProductValidation, validationHelper, updateProduct);
productRouter.delete('/delete', verifyToken, deleteProductValidation, validationHelper, deleteProduct);
productRouter.get('/getById', verifyToken, getProductByIdValidation, validationHelper, getProductById);
productRouter.get('/getAllProductsByUser', verifyToken, getAllProductsByUser);

export default productRouter;
