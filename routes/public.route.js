import express from 'express';
import { verifySecretKey } from '../middlewares/verifySecretKey.js';
import { getMenuBySlug } from '../controllers/public.controller.js';


const publicRouter = express.Router();

publicRouter.post('/getMenuBySlug', verifySecretKey, getMenuBySlug);


export default publicRouter;