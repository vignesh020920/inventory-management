// src/schemas/categorySchema.ts
import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

// Define the type to match what your form expects
export type CategoryFormValues = {
  name: string;
  description?: string;
  status: "active" | "inactive";
};
