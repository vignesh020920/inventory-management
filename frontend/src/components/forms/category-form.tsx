// src/components/forms/category-form.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCategoryStore } from "@/stores/categoryStore";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/schemas/categorySchema";
import { type Category } from "@/types/category";

interface CategoryFormProps {
  mode?: "create" | "edit" | "view";
  category?: Category | null;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function CategoryForm({
  mode = "create",
  category = null,
  onCancel,
  onSuccess,
}: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active" as const, // This will now be the actual default, not from schema
    },
  });

  const { loading, createCategory, updateCategory } = useCategoryStore();

  // Reset form when category changes
  useEffect(() => {
    if (category && mode === "edit") {
      form.reset({
        name: category.name,
        description: category.description || "",
        status: category.status,
      });
    } else if (mode === "create") {
      form.reset({
        name: "",
        description: "",
        status: "active",
      });
    }
  }, [category, mode, form]);

  const handleSubmit = async (data: CategoryFormValues) => {
    try {
      if (mode === "create") {
        await createCategory(data);
        form.reset({
          name: "",
          description: "",
          status: "active",
        });
      } else if (mode === "edit" && category) {
        await updateCategory(category._id, data);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting category:", error);
    }
  };

  const handleCancel = () => {
    form.reset({
      name: "",
      description: "",
      status: "active",
    });
    onCancel?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Category Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Rack Angle, Rack Panel"
                  className="h-11"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Choose a descriptive name for this product category
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional description of the category..."
                  className="min-h-[100px] resize-none"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide additional details about this category (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium inline-block w-fit">
                Status
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value} // Use value instead of defaultValue
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select category status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="default"
                        className="w-2 h-2 p-0 rounded-full bg-green-500"
                      />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 p-0 rounded-full bg-gray-400"
                      />
                      Inactive
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Set the category status to control visibility
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-6">
          <Button type="submit" disabled={loading} className="flex-1 h-11">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : (
              <>
                {mode === "create" ? (
                  <Plus className="mr-2 h-4 w-4" />
                ) : (
                  <Edit className="mr-2 h-4 w-4" />
                )}
                {mode === "create" ? "Create Category" : "Update Category"}
              </>
            )}
          </Button>

          {mode === "create" && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                form.reset({
                  name: "",
                  description: "",
                  status: "active",
                })
              }
              disabled={loading}
              className="h-11"
            >
              Clear
            </Button>
          )}

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="h-11"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
