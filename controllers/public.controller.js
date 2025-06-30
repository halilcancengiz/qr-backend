import responseHelper from "../helpers/responseHelper.js";
import Business from "../models/business.model.js";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getMenuBySlug = async (req, res) => {
    console.log(req.body)
    try {
        const { slug } = req.body;
        if (!slug) return responseHelper(res, 400, 'Slug is required.');

        // 1. Slug üzerinden business'ı bul
        const business = await Business.findOne({ slug });
        if (!business) return responseHelper(res, 404, 'Business not found.');

        const userId = business.userId;

        // 2. Kullanıcının temasını bul
        const user = await User.findById(userId);
        if (!user) return responseHelper(res, 404, 'User not found.');

        const currentTheme = user.currentTheme || "theme1"; // varsayılan olarak theme1

        // 3. Kullanıcının kategorilerini bul
        const categories = await Category.find({ userId });

        // 4. Her kategoriye ait ürünleri al
        const menu = await Promise.all(
            categories.map(async (category) => {
                const products = await Product.find({ categoryId: category._id });
                return {
                    ...category._doc,
                    products,
                };
            })
        );

        // 5. Cevabı döndür
        return responseHelper(res, 200, 'Menu retrieved successfully.', {
            business,
            menu,
            theme: currentTheme,
        });

    } catch (error) {
        console.error('Error retrieving menu:', error);
        return responseHelper(res, 500, 'An error occurred while retrieving the menu.', error.message);
    }
};
