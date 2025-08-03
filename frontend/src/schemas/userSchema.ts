// src/schemas/userSchema.ts
import { z } from "zod";

// Address schema
const addressSchema = z.object({
  street: z
    .string()
    .max(100, "Street must be less than 100 characters")
    .optional(),
  city: z.string().max(50, "City must be less than 50 characters").optional(),
  state: z.string().max(50, "State must be less than 50 characters").optional(),
  zipCode: z
    .string()
    .max(10, "Zip code must be less than 10 characters")
    .optional(),
  country: z
    .string()
    .max(50, "Country must be less than 50 characters")
    .optional(),
});

// Social links schema
const socialLinksSchema = z.object({
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  twitter: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  linkedin: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  github: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

// Profile schema
const profileSchema = z.object({
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-\(\)]{10,15}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  dateOfBirth: z.string().optional(),
  address: addressSchema.optional(),
  socialLinks: socialLinksSchema.optional(),
});

// Create user schema (password required)
export const userFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ), // Remove .optional() - password is required for creation
  role: z.enum(["user", "admin"]),
  status: z.enum(["active", "inactive", "suspended"]),
  isEmailVerified: z.boolean(),
  profile: profileSchema.optional(),
});

// Update user schema (password not included)
export const updateUserFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["user", "admin"]),
  status: z.enum(["active", "inactive", "suspended"]),
  isEmailVerified: z.boolean(),
  profile: profileSchema.optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;
