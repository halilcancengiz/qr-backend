import path from "path";
import { deleteImageWhileOnError } from "../helpers/deleteUploadedImageOnError.js";
import responseHelper from "../helpers/responseHelper.js";
import Product from "../models/product.model.js";
import { getUserIdFromToken } from "../utils/getUserIdFromToken.js";
import Category from "../models/category.model.js";

export const createProduct = async (req, res) => {
    try {
        const { categoryId, name, description, price, currency, preparationTime, isVisible, allergens } = req.body;

        const token = req.cookies.token;
        const userId = getUserIdFromToken(token);
        if (!userId) return responseHelper(res, 401, "User not authenticated.");

        const image = req.file ? path.posix.join("uploads", req.file.filename) : null;

        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            if (req.file) deleteImageWhileOnError(image);
            return responseHelper(res, 400, "Category not found.");
        }

        const existingProduct = await Product.findOne({ name, categoryId, userId });
        if (existingProduct) {
            if (req.file) deleteImageWhileOnError(image);
            return responseHelper(res, 409, "Product already exists.");
        }

        const productCount = await Product.countDocuments({ categoryId, userId }) + 1;


        // allergens string ise parse et
        let parsedAllergens = [];
        if (allergens) {
            if (typeof allergens === "string") {
                try {
                    parsedAllergens = JSON.parse(allergens);
                } catch (err) {
                    return responseHelper(res, 400, "Invalid allergens format. It must be a JSON array.");
                }
            } else if (Array.isArray(allergens)) {
                parsedAllergens = allergens;
            }
        }

        const product = await Product.create({
            userId,
            categoryId,
            name,
            description: description || "",
            price,
            currency,
            image,
            allergens: parsedAllergens, // <-- eklendi
            preparationTime: preparationTime || 0,
            sortOrder: productCount,
            isVisible: isVisible !== undefined ? isVisible : true,
        });

        return responseHelper(res, 201, "Product created successfully.", product);
    } catch (error) {
        if (req.file) deleteImageWhileOnError(path.posix.join("uploads", req.file.filename));
        return responseHelper(res, 500, "An error occurred while creating the product.", error.message);
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.body;

        const token = req.cookies.token;
        const userId = getUserIdFromToken(token);
        if (!userId) return responseHelper(res, 401, "User not authenticated.");

        const product = await Product.findById(productId);
        if (!product) return responseHelper(res, 404, "Product not found.");

        if (product.userId.toString() !== userId) {
            return responseHelper(res, 403, "You are not authorized to delete this product.");
        }

        const { sortOrder, categoryId } = product;

        if (product.image) {
            deleteImageWhileOnError(product.image);
        }

        await Product.findByIdAndDelete(productId);
        await Product.updateMany(
            {
                userId,
                categoryId,
                sortOrder: { $gt: sortOrder }
            },
            {
                $inc: { sortOrder: -1 }
            }
        );

        return responseHelper(res, 200, "Product deleted and sortOrder updated.");
    } catch (error) {
        return responseHelper(res, 500, "An error occurred while deleting the product.", error.message);
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { categoryId, productId, name, description, price, currency, preparationTime, isVisible, allergens } = req.body;

        const token = req.cookies.token;
        const userId = getUserIdFromToken(token);
        if (!userId) return responseHelper(res, 401, "User not authenticated.");

        const product = await Product.findById(productId);
        if (!product) return responseHelper(res, 404, "Product not found.");

        if (product.userId.toString() !== userId) {
            return responseHelper(res, 403, "You are not authorized to update this product.");
        }

        // Yeni image geldiyse eskiyi sil
        let newImage = product.image;
        if (req.file) {
            newImage = path.posix.join("uploads", req.file.filename);
            if (product.image) deleteImageWhileOnError(product.image);
        }



        // allergens parse
        let parsedAllergens = product.allergens || [];
        if (allergens) {
            if (typeof allergens === "string") {
                try {
                    parsedAllergens = JSON.parse(allergens);
                } catch (err) {
                    return responseHelper(res, 400, "Invalid allergens format. It must be a JSON array.");
                }
            } else if (Array.isArray(allergens)) {
                parsedAllergens = allergens;
            }
        }

        // Ürünü güncelle
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price !== undefined ? price : product.price;
        product.currency = currency || product.currency;
        product.allergens = parsedAllergens; // <-- eklendi
        product.preparationTime = preparationTime !== undefined ? preparationTime : product.preparationTime;
        product.isVisible = isVisible !== undefined ? isVisible : product.isVisible;
        product.image = newImage;
        product.categoryId = categoryId || product.categoryId;

        await product.save();

        return responseHelper(res, 200, "Product updated successfully.", product);
    } catch (error) {
        if (req.file) deleteImageWhileOnError(path.posix.join("uploads", req.file.filename));
        return responseHelper(res, 500, "An error occurred while updating the product.", error.message);
    }
};

export const getProductById = async (req, res) => {
    try {
        const { productId } = req.query;  // query'den alıyoruz
        const token = req.cookies.token;
        const userId = getUserIdFromToken(token);
        if (!userId) return responseHelper(res, 401, "User not authenticated.");

        if (!productId) {
            return responseHelper(res, 400, "ProductId query parameter is required.");
        }

        const product = await Product.findById(productId);

        if (!product) {
            return responseHelper(res, 404, "Product not found.");
        }

        return responseHelper(res, 200, "Product retrieved successfully.", product);
    } catch (error) {
        return responseHelper(res, 500, "An error occurred while retrieving the product.", error.message);
    }
};

export const getAllProductsByUser = async (req, res) => {
    try {
        const token = req.cookies.token;
        const userId = getUserIdFromToken(token);
        if (!userId) return responseHelper(res, 401, "User not authenticated.");

        const { page = 1, limit = 10, search, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // 🔍 Arama filtresi
        const filter = {
            userId,
        };

        if (search) {
            filter.name = { $regex: search, $options: "i" }; // case-insensitive
        }

        // 🔃 Sıralama dinamik
        const sortOptions = {};
        const validSortFields = ["name", "price", "createdAt", "sortOrder", "preparationTime"];
        if (validSortFields.includes(sortBy)) {
            sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
        } else {
            sortOptions["createdAt"] = -1; // default
        }

        // Toplam ürün sayısını al
        const total = await Product.countDocuments(filter);

        // Ürünleri MongoDB'den filtrele + sırala + sayfala
        const products = await Product.find(filter)
            .sort(sortOptions)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();

        return responseHelper(res, 200, "Products retrieved successfully.", {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
            products,
        });
    } catch (error) {
        return responseHelper(res, 500, "An error occurred while retrieving products.", error.message);
    }
};




