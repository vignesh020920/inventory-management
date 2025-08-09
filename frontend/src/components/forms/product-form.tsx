// components/forms/product-form.tsx
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Plus,
  X,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProductStore } from "@/stores/productStore";
import { Badge } from "../ui/badge";
import { Label } from "@/components/ui/label";
// import { IMAGE_URL } from "@/lib/utils";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/schemas/productSchema";

interface ProductFormProps {
  initialData?: Partial<ProductFormValues>;
  mode?: "create" | "edit" | "view";
  productId?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function ProductForm({
  initialData,
  mode = "create",
  productId,
  onCancel,
  onSuccess,
}: ProductFormProps) {
  const [tagInput, setTagInput] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<number[]>([]);

  // Zustand stores
  const {
    createProduct,
    updateProduct,
    error: productError,
    isFormSubmitting,
    clearError: clearProductError,
  } = useProductStore();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      stockQuantity: undefined, // Changed from 0
      images: [],
      tags: [],
      description: "",
      ...initialData,
    },
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
    update: updateImage,
  } = useFieldArray({
    control: form.control,
    name: "images",
  });

  // Clear errors when form changes
  useEffect(() => {
    if (productError) {
      const timer = setTimeout(() => clearProductError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [productError, clearProductError]);

  // // File upload handler
  // const handleFileUpload = async (file: File, index: number) => {
  //   if (!file) return;

  //   // Validate file type
  //   if (!file.type.startsWith("image/")) {
  //     alert("Please select an image file");
  //     return;
  //   }

  //   // Validate file size (5MB max)
  //   if (file.size > 5 * 1024 * 1024) {
  //     alert("Image size should be less than 5MB");
  //     return;
  //   }

  //   setUploadingImages((prev) => [...prev, index]);

  //   try {
  //     // Create preview URL
  //     const previewUrl = URL.createObjectURL(file);

  //     // Update the image field with file and preview
  //     const currentImage = imageFields[index] || {};
  //     updateImage(index, {
  //       ...currentImage,
  //       file: file, // Ensure this is the actual File object
  //       preview: previewUrl,
  //       url: previewUrl, // For consistency with form data structure
  //       alt: currentImage.alt || file.name.split(".")[0], // Use filename without extension as default alt
  //     });

  //     console.log(`File uploaded at index ${index}:`, {
  //       name: file.name,
  //       size: file.size,
  //       type: file.type,
  //       isFile: file instanceof File,
  //     });
  //   } catch (error) {
  //     console.error("File upload error:", error);
  //     alert("Failed to upload image");
  //   } finally {
  //     setUploadingImages((prev) => prev.filter((i) => i !== index));
  //   }
  // };

  // // In your ProductForm component's handleSubmit function
  // const handleSubmit = async (data: ProductFormValues) => {
  //   try {
  //     clearProductError();

  //     // Prepare form data for submission including files
  //     const formData = new FormData();

  //     // Add text fields
  //     formData.append("name", data.name);
  //     formData.append("stockQuantity", data.stockQuantity.toString());
  //     if (data.description) formData.append("description", data.description);
  //     // Add tags
  //     if (data.tags && data.tags.length > 0) {
  //       formData.append("tags", JSON.stringify(data.tags));
  //     }

  //     // Process images
  //     const imageAlts: string[] = [];
  //     const existingImages: any[] = [];
  //     let newFileCount = 0;

  //     data.images?.forEach((image, index) => {
  //       console.log(`Image ${index}:`, {
  //         hasFile: !!image.file,
  //         hasUrl: !!image.url,
  //         isFileInstance: image.file instanceof File,
  //         alt: image.alt,
  //       });

  //       if (image.file && image.file instanceof File) {
  //         // New uploaded file - ensure it's a valid File object
  //         console.log(`Adding new file ${newFileCount}:`, image.file.name);
  //         formData.append("images", image.file);
  //         imageAlts.push(image.alt || "");
  //         newFileCount++;
  //       } else if (image.url && mode === "edit") {
  //         // Existing image in edit mode
  //         console.log(`Preserving existing image:`, image.url);
  //         existingImages.push({
  //           url: image.url,
  //           alt: image.alt || "",
  //         });
  //       }
  //     });

  //     // Add image alt texts for new files
  //     imageAlts.forEach((alt) => {
  //       formData.append("imageAlts", alt);
  //     });

  //     // Add existing images for edit mode
  //     if (mode === "edit" && existingImages.length > 0) {
  //       existingImages.forEach((img) => {
  //         formData.append("existingImages", JSON.stringify(img));
  //       });
  //     }

  //     for (let [key, value] of formData.entries()) {
  //       if (value instanceof File) {
  //         console.log(key, `File: ${value.name} (${value.size} bytes)`);
  //       } else {
  //         console.log(key, value);
  //       }
  //     }

  //     if (mode === "create") {
  //       console.log("Creating product with FormData...");
  //       await createProduct(formData);
  //     } else if (mode === "edit" && productId) {
  //       console.log("Updating product with FormData...");
  //       await updateProduct(productId, formData);
  //     }

  //     // Show success message
  //     setShowSuccess(true);
  //     setTimeout(() => setShowSuccess(false), 3000);

  //     // Reset form for create mode
  //     if (mode === "create") {
  //       clearForm();
  //       // Clean up preview URLs to prevent memory leaks
  //       data.images?.forEach((image) => {
  //         if (image.preview && image.preview.startsWith("blob:")) {
  //           URL.revokeObjectURL(image.preview);
  //         }
  //       });
  //     }

  //     // Call success callback
  //     onSuccess?.();
  //   } catch (error) {
  //     console.error("Form submission error:", error);

  //     // Clean up preview URLs on error as well
  //     data.images?.forEach((image) => {
  //       if (image.preview && image.preview.startsWith("blob:")) {
  //         URL.revokeObjectURL(image.preview);
  //       }
  //     });
  //   }
  // };

  // components/forms/product-form.tsx - Key sections updated

  // File upload handler - UPDATED
  const handleFileUpload = async (file: File, index: number) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    // Validate file is not empty
    if (file.size === 0) {
      alert("Selected file is empty. Please choose a valid image.");
      return;
    }

    setUploadingImages((prev) => [...prev, index]);

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      // Update the image field with file and preview
      const currentImage = imageFields[index] || {};
      updateImage(index, {
        ...currentImage,
        file: file, // Keep original File object
        preview: previewUrl,
        url: "", // Clear any existing URL for new uploads
        alt: currentImage.alt || file.name.split(".")[0],
      });

      console.log(`File uploaded at index ${index}:`, {
        name: file.name,
        size: file.size,
        type: file.type,
        isFile: file instanceof File,
        hasBuffer: file.size > 0, // Verify file has content
      });
    } catch (error) {
      console.error("File upload error:", error);
      alert("Failed to process image file");
    } finally {
      setUploadingImages((prev) => prev.filter((i) => i !== index));
    }
  };

  // Updated handleSubmit function - ENHANCED VALIDATION
  const handleSubmit = async (data: ProductFormValues) => {
    try {
      clearProductError();

      // Prepare form data for submission including files
      const formData = new FormData();

      // Add text fields
      formData.append("name", data.name);
      formData.append("stockQuantity", data.stockQuantity.toString());
      if (data.description) formData.append("description", data.description);

      // Add tags
      if (data.tags && data.tags.length > 0) {
        formData.append("tags", JSON.stringify(data.tags));
      }

      // Process images with enhanced validation
      const imageAlts: string[] = [];
      const existingImages: any[] = [];
      let newFileCount = 0;
      let hasValidFiles = false;

      data.images?.forEach((image, index) => {
        console.log(`Processing image ${index}:`, {
          hasFile: !!image.file,
          hasUrl: !!image.url,
          isFileInstance: image.file instanceof File,
          fileSize: image.file?.size || 0,
          fileName: image.file?.name || "N/A",
          alt: image.alt,
        });

        if (image.file && image.file instanceof File) {
          // Additional validation for File object
          if (image.file.size === 0) {
            console.error(`File at index ${index} is empty:`, image.file.name);
            throw new Error(`Image "${image.file.name}" is empty or corrupted`);
          }

          if (!image.file.type.startsWith("image/")) {
            console.error(
              `File at index ${index} is not an image:`,
              image.file.type
            );
            throw new Error(`File "${image.file.name}" is not a valid image`);
          }

          // New uploaded file - ensure it's a valid File object
          console.log(`Adding new file ${newFileCount}:`, {
            name: image.file.name,
            size: image.file.size,
            type: image.file.type,
          });

          formData.append("images", image.file);
          imageAlts.push(image.alt || "");
          newFileCount++;
          hasValidFiles = true;
        } else if (image.url && mode === "edit") {
          // Existing image in edit mode
          console.log(`Preserving existing image:`, image.url);
          existingImages.push({
            url: image.url,
            alt: image.alt || "",
          });
        }
      });

      // Validate we have at least some content for new products
      if (mode === "create" && !hasValidFiles) {
        alert("Please add at least one valid image for the product");
        return;
      }

      // Add image alt texts for new files
      imageAlts.forEach((alt) => {
        formData.append("imageAlts", alt);
      });

      // Add existing images for edit mode
      if (mode === "edit" && existingImages.length > 0) {
        existingImages.forEach((img) => {
          formData.append("existingImages", JSON.stringify(img));
        });
      }

      // Debug FormData contents
      console.log("=== FRONTEND FORMDATA DEBUG ===");
      let totalFiles = 0;
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            key,
            `File: ${value.name} (${value.size} bytes, ${value.type})`
          );
          totalFiles++;
        } else {
          console.log(key, value);
        }
      }
      console.log(`Total files to upload: ${totalFiles}`);
      console.log("=== END FRONTEND DEBUG ===");

      if (mode === "create") {
        console.log("Creating product with FormData...");
        await createProduct(formData);
      } else if (mode === "edit" && productId) {
        console.log("Updating product with FormData...");
        await updateProduct(productId, formData);
      }

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reset form for create mode
      if (mode === "create") {
        clearForm();
      }

      // Call success callback
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);

      // Show user-friendly error
      if (error instanceof Error) {
        alert(error.message);
      }

      // Clean up preview URLs on error
      data.images?.forEach((image) => {
        if (image.preview && image.preview.startsWith("blob:")) {
          URL.revokeObjectURL(image.preview);
        }
      });
    }
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues("tags") || [];
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("tags", [...currentTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const addImage = () => {
    appendImage({ file: null, url: "", alt: "", preview: "" });
  };

  const clearForm = () => {
    // Clean up preview URLs
    imageFields.forEach((field) => {
      if (field.preview) {
        URL.revokeObjectURL(field.preview);
      }
    });

    form.reset({
      name: "",
      stockQuantity: undefined, // Changed from 0
      images: [],
      tags: [],
      description: "",
    });
    setTagInput("");
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imageFields.forEach((field) => {
        if (field.preview) {
          URL.revokeObjectURL(field.preview);
        }
      });
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Success Alert */}
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Product {mode === "create" ? "created" : "updated"} successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {productError && (
        <Alert variant="destructive">
          <AlertDescription className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <AlertCircle className="h-4 w-4" />
              {productError}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1"
              onClick={() => {
                clearProductError();
              }}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Basic Information - Same as before */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Basic Information</h3>
              <p className="text-sm text-muted-foreground">
                Essential product details
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Rack Angle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={field.value ?? ""} // Show empty string if undefined
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : Number(value)
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Product description..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Tags - Keep existing */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Tags</h3>
              <p className="text-sm text-muted-foreground">
                Add tags to help categorize and search for this product
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Enter tag..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {form.watch("tags") && form.watch("tags")!.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.watch("tags")?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Updated Images Section with File Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Product Images</h3>
                <p className="text-sm text-muted-foreground">
                  Upload product images (max 5MB each)
                </p>
              </div>
              <Button type="button" onClick={addImage} variant="outline">
                <ImageIcon className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </div>

            {imageFields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-4">
                    {/* File Upload */}
                    <div>
                      <Label htmlFor={`image-${index}`}>Select Image</Label>
                      <div className="mt-2 flex items-center gap-4">
                        {/* <Input
                          id={`image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, index);
                            }
                          }}
                          className="cursor-pointer"
                          disabled={uploadingImages.includes(index)}
                        /> */}

                        <Input
                          id={`image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Immediate validation before processing
                              if (file.size === 0) {
                                alert(
                                  `File "${file.name}" is empty. Please select a valid image.`
                                );
                                e.target.value = ""; // Clear the input
                                return;
                              }

                              if (file.size > 5 * 1024 * 1024) {
                                alert(
                                  `File "${file.name}" is too large. Maximum size is 5MB.`
                                );
                                e.target.value = ""; // Clear the input
                                return;
                              }

                              console.log("File selected:", {
                                name: file.name,
                                size: file.size,
                                type: file.type,
                                lastModified: file.lastModified,
                              });

                              handleFileUpload(file, index);
                            }
                          }}
                          className="cursor-pointer"
                          disabled={uploadingImages.includes(index)}
                        />
                        {uploadingImages.includes(index) && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                    </div>

                    {/* Image Preview */}
                    {(field.preview || field.url) && (
                      <div className="mt-2">
                        <img
                          // src={field.preview || `${IMAGE_URL}${field.url}`}
                          src={field.preview || field.url}
                          alt={field.alt || "Product image"}
                          className="w-32 h-32 object-cover rounded-md border"
                        />
                      </div>
                    )}

                    {/* Alt Text */}
                    <FormField
                      control={form.control}
                      name={`images.${index}.alt`}
                      render={({ field: altField }) => (
                        <FormItem>
                          <FormLabel>Alt Text</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Image description"
                              {...altField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Clean up preview URL
                      if (field.preview) {
                        URL.revokeObjectURL(field.preview);
                      }
                      removeImage(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              disabled={isFormSubmitting || uploadingImages.length > 0}
              className="flex-1 h-11"
            >
              {isFormSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {mode === "create" ? "Create Product" : "Update Product"}
                </>
              )}
            </Button>

            {mode === "create" && (
              <Button
                type="button"
                variant="outline"
                onClick={clearForm}
                disabled={isFormSubmitting}
                className="h-11"
              >
                Clear Form
              </Button>
            )}

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isFormSubmitting}
                className="h-11"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
