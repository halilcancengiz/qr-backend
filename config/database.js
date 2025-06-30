import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const mongoURI = process.env.MONGO_URI;

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {});
    console.log("MongoDB'ye başarıyla bağlandı");
  } catch (err) {
    console.error("MongoDB bağlantı hatası:", err);
    process.exit(1);
  }
};
