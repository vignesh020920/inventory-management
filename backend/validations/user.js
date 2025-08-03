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

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 50 characters",
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),

  password: Joi.string()
    .min(8)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]"
      )
    )
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),

  role: Joi.string().valid("user", "admin").default("user"),

  status: Joi.string()
    .valid("active", "inactive", "suspended")
    .default("active"),

  isEmailVerified: Joi.boolean().default(false),

  profile: Joi.object({
    bio: Joi.string().max(500).allow(""),
    phone: Joi.string()
      .pattern(/^[+]?[\d\s\-\(\)]{10,15}$/)
      .allow(""),
    dateOfBirth: Joi.date().max("now").allow(null),
    address: Joi.object({
      street: Joi.string().max(100).allow(""),
      city: Joi.string().max(50).allow(""),
      state: Joi.string().max(50).allow(""),
      zipCode: Joi.string().max(10).allow(""),
      country: Joi.string().max(50).allow(""),
    }).allow(null),
    socialLinks: Joi.object({
      website: Joi.string().uri().allow(""),
      twitter: Joi.string().uri().allow(""),
      linkedin: Joi.string().uri().allow(""),
      github: Joi.string().uri().allow(""),
    }).allow(null),
  }).allow(null),
});

const bulkCreateUsersSchema = Joi.object({
  users: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string()
          .min(8)
          .pattern(
            new RegExp(
              "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]"
            )
          )
          .optional(),
        role: Joi.string().valid("user", "admin").default("user"),
        status: Joi.string()
          .valid("active", "inactive", "suspended")
          .default("active"),
        isEmailVerified: Joi.boolean().default(false),
        profile: Joi.object({
          bio: Joi.string().max(500).allow(""),
          phone: Joi.string()
            .pattern(/^[+]?[\d\s\-\(\)]{10,15}$/)
            .allow(""),
          dateOfBirth: Joi.date().max("now").allow(null),
          address: Joi.object({
            street: Joi.string().max(100).allow(""),
            city: Joi.string().max(50).allow(""),
            state: Joi.string().max(50).allow(""),
            zipCode: Joi.string().max(10).allow(""),
            country: Joi.string().max(50).allow(""),
          }).allow(null),
          socialLinks: Joi.object({
            website: Joi.string().uri().allow(""),
            twitter: Joi.string().uri().allow(""),
            linkedin: Joi.string().uri().allow(""),
            github: Joi.string().uri().allow(""),
          }).allow(null),
        }).allow(null),
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      "array.min": "At least one user is required",
      "array.max": "Cannot create more than 50 users at once",
    }),
});

const bulkDeleteUsersSchema = Joi.object({
  userIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          "string.pattern.base": "Invalid user ID format",
        })
    )
    .min(1)
    .max(100)
    .required()
    .messages({
      "array.min": "At least one user ID is required",
      "array.max": "Cannot delete more than 100 users at once",
    }),
});

module.exports = {
  updateProfileSchema,
  adminUpdateUserSchema,
  updateUserStatusSchema,
  createUserSchema,
  bulkCreateUsersSchema,
  bulkDeleteUsersSchema,
};
