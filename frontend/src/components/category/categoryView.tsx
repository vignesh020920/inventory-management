// src/components/category/categoryView.tsx

import { format } from "date-fns";
import { Calendar, FolderOpen, Package, Edit, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type Category } from "@/types/category";

interface CategoryViewProps {
  category: Category | null;
  onClose: () => void;
  onEdit?: () => void;
}

export function CategoryView({ category, onClose, onEdit }: CategoryViewProps) {
  if (!category) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No category data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {category.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={
                      category.status === "active" ? "default" : "secondary"
                    }
                  >
                    {category.status.charAt(0).toUpperCase() +
                      category.status.slice(1)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-blue-600 border-blue-600"
                  >
                    <Package className="h-3 w-3 mr-1" />
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "Product" : "Products"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Category Name
              </label>
              <p className="text-base font-medium mt-1">{category.name}</p>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="text-base mt-1">
                {category.description || (
                  <span className="text-muted-foreground italic">
                    No description provided
                  </span>
                )}
              </p>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="mt-1">
                <Badge
                  variant={
                    category.status === "active" ? "default" : "secondary"
                  }
                  className="text-sm"
                >
                  {category.status.charAt(0).toUpperCase() +
                    category.status.slice(1)}
                </Badge>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Product Count
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-base font-medium">
                  {category.productCount}{" "}
                  {category.productCount === 1 ? "Product" : "Products"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Category ID
              </label>
              <p className="text-base font-mono mt-1 bg-muted px-2 py-1 rounded">
                {category._id}
              </p>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created Date
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-base">
                  {format(new Date(category.createdAt), "PPP 'at' p")}
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-base">
                  {format(new Date(category.updatedAt), "PPP 'at' p")}
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Version
              </label>
              <p className="text-base mt-1">v{category.__v}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Category created {format(new Date(category.createdAt), "PPP")}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {onEdit && (
                <Button onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Category
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
