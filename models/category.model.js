import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  name: { type: String, required: true, lowercase: true, trim: true },
  image: { type: String, default: null },
  sortOrder: { type: Number, default: 1 },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;