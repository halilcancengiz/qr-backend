import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/database.js';
import authRouter from './routes/auth.route.js';
import categoryRouter from './routes/category.route.js';
import productRouter from './routes/product.route.js';
import businessRouter from './routes/business.route.js';
import publicRouter from './routes/public.route.js';

const app = express();

const __dirname = path.resolve();

app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://v1qr-preview.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
dotenv.config();
connectDB();

// endpoints
app.use("/api/auth", authRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/business", businessRouter);
app.use("/api/public", publicRouter);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda başlatıldı`);
});
