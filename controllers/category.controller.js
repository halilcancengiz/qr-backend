import responseHelper from "../helpers/responseHelper.js"
import { getUserIdFromToken } from "../utils/getUserIdFromToken.js"
import path from 'path';
import Category from "../models/category.model.js"
import { deleteImageWhileOnError } from "../helpers/deleteUploadedImageOnError.js";
import Product from "../models/product.model.js";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const token = req.cookies.token;
    const userId = getUserIdFromToken(token);
    if (!userId) return responseHelper(res, 404, 'User not authenticated');

    const image = req.file ? path.posix.join('uploads', req.file.filename) : null;

    const existingCategory = await Category.findOne({ name, userId });
    if (existingCategory) {
      if (req.file) deleteImageWhileOnError(image);
      return responseHelper(res, 409, 'Category already exists.');
    }

    const sortOrder = await Category.countDocuments({ userId }) + 1;

    const category = await Category.create({
      name,
      userId,
      image,
      sortOrder
    });

    return responseHelper(res, 201, 'Category created successfully.', category);

  } catch (error) {
    return responseHelper(res, 500, 'An error occurred while creating the category.', error);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { categoryId, name, isVisible } = req.body;
    const token = req.cookies.token;
    const userId = getUserIdFromToken(token);
    if (!userId) return responseHelper(res, 404, 'User not authenticated');

    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) return responseHelper(res, 404, 'Category not found.');

    const updateData = {};

    if (typeof name !== 'undefined') updateData.name = name;
    if (typeof isVisible !== 'undefined') updateData.isVisible = isVisible;

    if (req.file) {
      const newImage = path.posix.join('uploads', req.file.filename);
      updateData.image = newImage;

      if (category.image) {
        deleteImageWhileOnError(category.image);
      }
    }

    // Güncelleme işlemi
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $set: updateData },
      { new: true }
    );

    return responseHelper(res, 200, 'Category updated successfully.', updatedCategory);

  } catch (error) {
    return responseHelper(res, 500, 'An error occurred while updating the category.', error);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    const token = req.cookies.token;
    const userId = getUserIdFromToken(token);
    if (!userId) return responseHelper(res, 404, 'User not authenticated');

    const categoryToDelete = await Category.findOne({ _id: categoryId, userId });
    if (!categoryToDelete) {
      return responseHelper(res, 404, 'Category not found.');
    }

    const deletedSortOrder = categoryToDelete.sortOrder;

    if (categoryToDelete.image) {
      deleteImageWhileOnError(categoryToDelete.image);
    }

    await Category.deleteOne({ _id: categoryId });

    await Category.updateMany(
      { userId, sortOrder: { $gt: deletedSortOrder } },
      { $inc: { sortOrder: -1 } }
    );

    return responseHelper(res, 200, 'Category deleted successfully.');

  } catch (error) {
    return responseHelper(res, 500, 'An error occurred while deleting the category.', error);
  }
};

export const getAllCategoriesWithProducts = async (req, res) => {
  try {
    const token = req.cookies.token;
    const userId = getUserIdFromToken(token);
    if (!userId) return responseHelper(res, 401, "User not authenticated.");

    // Query parametreleri (hepsi optional olacak şekilde tanımlandı)
    const {
      sortBy,
      sortOrder,
      page,
      limit,
      search
    } = req.query;

    const sortDirection = sortOrder === "desc" ? -1 : 1;

    // Filtreleme işlemi
    const filter = { userId };

    // Kategorileri al (sortBy varsa ona göre sırala, yoksa sırasız getir)
    const categoriesQuery = Category.find(filter);

    if (sortBy) {
      categoriesQuery.sort({ [sortBy]: sortDirection });
    }

    const categories = await categoriesQuery.lean();
    const totalCategories = categories.length;

    // Sayfalama uygula (limit varsa uygula, yoksa tümünü getir)
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit);

    const paginatedCategories =
      limitNum > 0
        ? categories.slice((pageNum - 1) * limitNum, pageNum * limitNum)
        : categories;

    // Kategorilere ait ürünleri getir
    const result = await Promise.all(
      paginatedCategories.map(async (category) => {
        const productFilter = {
          userId,
          categoryId: category._id,
        };

        if (search) {
          productFilter.name = { $regex: search, $options: "i" };
        }

        const productQuery = Product.find(productFilter);

        if (sortBy) {
          productQuery.sort({ [sortBy]: sortDirection });
        }

        const products = await productQuery.lean();

        return {
          ...category,
          products,
        };
      })
    );

    return responseHelper(res, 200, "Categories with products retrieved successfully.", {
      total: totalCategories,
      page: limitNum ? pageNum : 1,
      limit: limitNum || totalCategories,
      totalPages: limitNum ? Math.ceil(totalCategories / limitNum) : 1,
      categories: result,
    });

  } catch (error) {
    return responseHelper(res, 500, "An error occurred while retrieving categories.", error.message);
  }
};


export const getCategoryById = async (req, res) => {
  const token = req.cookies.token;
  const userId = getUserIdFromToken(token);

  if (!userId) {
    return responseHelper(res, 404, 'User not authenticated');
  }

  try {
    const { categoryId } = req.body;

    const category = await Category.findOne({ _id: categoryId, userId });

    if (!category) {
      return responseHelper(res, 404, 'Category not found.');
    }

    return responseHelper(res, 200, 'Category retrieved successfully.', category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return responseHelper(res, 500, 'An error occurred while retrieving the category.', error);
  }
};

export const getAllCategoryList = async (req, res) => {
  try {
    const token = req.cookies.token;
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return responseHelper(res, 401, "User not authenticated.");
    }

    const categories = await Category.find({}, "_id name").lean();

    // Format: { label, value } - frontend select için
    const formattedCategories = categories.map((category) => ({
      _id: category._id,
      name: category.name,
    }));

    return responseHelper(res, 200, "Categories fetched successfully.", formattedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return responseHelper(res, 500, "An error occurred while retrieving the categories.", error);
  }
};

