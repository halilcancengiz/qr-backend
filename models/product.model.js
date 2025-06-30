import mongoose from 'mongoose';

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

const productSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    categoryId: { type: mongoose.Types.ObjectId, required: true, ref: "Category" },
    name: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, lowercase: true, trim: true, default: "" },
    price: { type: Number, required: true },
    currency: { type: String, required: true, enum: ['TRY', 'USD', 'EUR'], default: 'TRY' },
    image: { type: String, default: null },
    preparationTime: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    allergens: {
        type: [String],
        enum: allergenEnum,
        default: []
    },
    sortOrder: { type: Number, default: 1 },
    isVisible: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
