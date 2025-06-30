import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },

    owner: {
        name: { type: String, required: true, trim: true, lowercase: true },
        phoneNumber: { type: String, required: true, trim: true },
    },

    slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },

    businessName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },

    businessPhoneNumber: { type: String, required: true, trim: true },

    businessType: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        enum: ['restaurant', 'cafe', 'bar', 'fastfood', 'bakery', 'bistro', 'pub', 'dessert', 'other']
    },

    image: { type: String, required: true, trim: true },

    businessAddress: {
        street: { type: String, required: true, trim: true, lowercase: true },
        city: { type: String, required: true, trim: true, lowercase: true },
        district: { type: String, required: true, trim: true, lowercase: true },
        zipCode: { type: String, required: true, trim: true },
        country: { type: String, required: true, default: "turkey", trim: true, lowercase: true },
    },

    openingHours: {
        type: String,
        required: true,
        trim: true,
        default: "09:00-22:00"
    },

    socialMedia: {
        instagram: { type: String, trim: true, lowercase: true, default: '' },
        facebook: { type: String, trim: true, lowercase: true, default: '' },
        x: { type: String, trim: true, lowercase: true, default: '' },
        website: { type: String, trim: true, lowercase: true, default: '' }
    }
}, { timestamps: true });

const Business = mongoose.model('Business', businessSchema);

export default Business;
