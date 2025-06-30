import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import upload from '../middlewares/upload.js';
import { validationHelper } from '../helpers/validationHelper.js';
import { deleteBusinessValidation, updateBusinessValidation, createBusinessValidation } from '../middlewares/validations/business/businessValidation.js';
import { createBusiness, deleteBusiness, getBusinessByUserId, updateBusiness } from '../controllers/business.controller.js';


const businessRouter = express.Router();

businessRouter.post('/create', verifyToken, upload.single('image'), createBusinessValidation, validationHelper, createBusiness);
businessRouter.post('/update', verifyToken, upload.single('image'), updateBusinessValidation, validationHelper, updateBusiness);
businessRouter.delete('/delete', verifyToken, deleteBusinessValidation, validationHelper, deleteBusiness);
businessRouter.get('/getByUserId', verifyToken, getBusinessByUserId);


export default businessRouter;