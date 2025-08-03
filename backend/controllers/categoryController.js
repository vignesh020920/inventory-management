// controllers/categoryController.js
const Category = require("../models/Category");
const httpStatus = require("http-status");
const moment = require("moment");

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    // Execute query
    const categories = await Category.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("productCount");

    const totalCategories = await Category.countDocuments(query);
    const totalPages = Math.ceil(totalCategories / limit);

    res.status(httpStatus.OK).json({
      success: true,
      data: {
        categories,
        pagination: {
          currentPage: page,
          totalPages,
          totalCategories,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get categories",
      error: error.message,
    });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "productCount"
    );

    if (!category) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(httpStatus.OK).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get category",
      error: error.message,
    });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Category created successfully",
      data: { category },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Category name already exists",
      });
    }

    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = ["name", "description", "status"];
    const updates = {};

    // Only allow specific fields to be updated
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const category = await Category.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: "Category updated successfully",
      data: { category },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Category name already exists",
      });
    }

    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const Product = require("../models/Product");

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Cannot delete category with existing products",
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

// Get category options for dropdown
const getCategoryOptions = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status == "active" ? { status: "active" } : {};
    const categories = await Category.find(query, "name").sort({
      name: 1,
    });

    const options = categories.map((category) => ({
      value: category._id,
      label: category.name,
    }));

    res.status(httpStatus.OK).json({
      success: true,
      data: { options },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get category options",
      error: error.message,
    });
  }
};

// Get category statistics
const getCategoryStats = async (req, res) => {
  try {
    const Product = require("../models/Product");

    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({
      status: "active",
    });
    const inactiveCategories = await Category.countDocuments({
      status: "inactive",
    });

    // Categories created in the last 30 days
    const thirtyDaysAgo = moment().subtract(30, "days").toDate();
    const newCategories = await Category.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.status(httpStatus.OK).json({
      success: true,
      data: {
        totalCategories,
        activeCategories,
        inactiveCategories,
        newCategories,
      },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get category statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryOptions,
  getCategoryStats,
};
