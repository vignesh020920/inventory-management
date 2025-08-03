import z from "zod";

// Updated schema for file upload
export const productFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  stockQuantity: z.number().min(0, "Stock quantity cannot be negative"),
  images: z
    .array(
      z.object({
        file: z.any().optional(), // For file upload
        url: z.string().optional(), // For existing images in edit mode
        alt: z.string().optional(),
        preview: z.string().optional(), // For preview URL
      })
    )
    .optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
