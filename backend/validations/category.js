// validations/category.js
const Joi = require("joi");

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Category name is required",
    "string.min": "Category name must be at least 2 characters",
    "string.max": "Category name cannot exceed 100 characters",
  }),

  description: Joi.string().trim().max(500).allow("").messages({
    "string.max": "Description cannot exceed 500 characters",
  }),

  status: Joi.string().valid("active", "inactive").default("active").messages({
    "any.only": "Status must be either active or inactive",
  }),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).messages({
    "string.min": "Category name must be at least 2 characters",
    "string.max": "Category name cannot exceed 100 characters",
  }),

  description: Joi.string().trim().max(500).allow("").messages({
    "string.max": "Description cannot exceed 500 characters",
  }),

  status: Joi.string().valid("active", "inactive").messages({
    "any.only": "Status must be either active or inactive",
  }),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
