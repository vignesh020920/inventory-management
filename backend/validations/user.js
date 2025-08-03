const Joi = require("joi");

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 50 characters",
  }),

  profile: Joi.object({
    bio: Joi.string().max(500).allow("").messages({
      "string.max": "Bio cannot exceed 500 characters",
    }),

    phone: Joi.string()
      .pattern(/^[+]?[1-9][\d\s-()]{7,15}$/)
      .allow("")
      .messages({
        "string.pattern.base": "Please provide a valid phone number",
      }),

    address: Joi.object({
      street: Joi.string().allow(""),
      city: Joi.string().allow(""),
      state: Joi.string().allow(""),
      zipCode: Joi.string().allow(""),
      country: Joi.string().allow(""),
    }),

    socialLinks: Joi.object({
      website: Joi.string().uri().allow(""),
      twitter: Joi.string().allow(""),
      linkedin: Joi.string().allow(""),
      github: Joi.string().allow(""),
    }),
  }),
});

const adminUpdateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 50 characters",
  }),

  email: Joi.string().email().trim().lowercase().messages({
    "string.email": "Please provide a valid email address",
  }),

  role: Joi.string().valid("user", "admin").messages({
    "any.only": "Role must be either user or admin",
  }),

  status: Joi.string().valid("active", "inactive", "suspended").messages({
    "any.only": "Status must be active, inactive, or suspended",
  }),

  isEmailVerified: Joi.boolean(),
});

const updateUserStatusSchema = Joi.object({
  status: Joi.string().valid("active", "inactive", "suspended").required(),
});

module.exports = {
  updateProfileSchema,
  adminUpdateUserSchema,
  updateUserStatusSchema,
};
