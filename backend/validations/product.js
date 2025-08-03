const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required().messages({
    "string.empty": "Product name is required",
    "string.min": "Product name must be at least 2 characters",
    "string.max": "Product name cannot exceed 200 characters",
  }),

  stockQuantity: Joi.number().integer().min(0).required().messages({
    "number.base": "Stock quantity must be a number",
    "number.integer": "Stock quantity must be an integer",
    "number.min": "Stock quantity cannot be negative",
    "any.required": "Stock quantity is required",
  }),

  tags: Joi.array().items(Joi.string().trim().max(50)).default([]),

  description: Joi.string().trim().max(1000).allow("").messages({
    "string.max": "Description cannot exceed 1000 characters",
  }),

  status: Joi.string()
    .valid("active", "inactive", "discontinued")
    .default("active"),

  // For handling alt texts (allow this field)
  imageAlts: Joi.array().items(Joi.string().allow("")).default([]),

  // For handling existing images in edit mode
  existingImages: Joi.array().items(Joi.string()).default([]),

  // Remove the images validation since files are handled by multer
  // images field is not needed in validation as files come through req.files
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200),

  stockQuantity: Joi.number().integer().min(0),

  tags: Joi.array().items(Joi.string().trim().max(50)),
  description: Joi.string().trim().max(1000).allow(""),
  status: Joi.string().valid("active", "inactive", "discontinued"),

  // Allow these fields for file upload handling
  imageAlts: Joi.array().items(Joi.string().allow("")).default([]),
  existingImages: Joi.array().items(Joi.string()).default([]),

  // Remove images validation for update as well
});

module.exports = {
  createProductSchema,
  updateProductSchema,
};
