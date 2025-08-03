import "./App.css";
import { ThemeProvider } from "./hooks/use-theme";
import AppRouter from "./router/appRouter";

function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}

export default App;

// // In your parent component
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { CategoryModal } from "@/components/modal/category-modal";
// import type { Category } from "./types/category";

// export default function CategoryManagement() {
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingCategory, setEditingCategory] = useState<Category | null>(null);
//   const [mode, setMode] = useState<"create" | "edit">("create");

//   const handleCreateNew = () => {
//     setMode("create");
//     setEditingCategory(null);
//     setModalOpen(true);
//   };

//   const handleEdit = (category: Category) => {
//     setMode("edit");
//     setEditingCategory(category);
//     setModalOpen(true);
//   };

//   const handleSuccess = () => {
//     // Refresh your data here
//     console.log("Category operation successful");
//   };

//   return (
//     <div>
//       <Button onClick={handleCreateNew}>Add New Category</Button>

//       <CategoryModal
//         open={modalOpen}
//         onOpenChange={setModalOpen}
//         mode={mode}
//         category={editingCategory}
//         onSuccess={handleSuccess}
//       />
//     </div>
//   );
// }

// In your parent component (e.g., ProductsPage.tsx)
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { ProductModal } from "@/components/modal/product-modal";
// import type { Product } from "@/types/product"; // Your product type

// export default function ProductsPage() {
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [mode, setMode] = useState<"create" | "edit">("create");

//   const handleCreateNew = () => {
//     setMode("create");
//     setEditingProduct(null);
//     setModalOpen(true);
//   };

//   const handleEdit = (product: Product) => {
//     setMode("edit");
//     setEditingProduct(product);
//     setModalOpen(true);
//   };

//   const handleSuccess = () => {
//     // Refresh your products list here
//     console.log("Product operation successful");
//     // You might want to refetch products or update the store
//   };

//   const handleCancel = () => {
//     setModalOpen(false);
//     setEditingProduct(null);
//   };

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Products</h1>
//         <Button onClick={handleCreateNew}>Add New Product</Button>
//       </div>

//       {/* Your products table/list here */}

//       <ProductModal
//         open={modalOpen}
//         onOpenChange={setModalOpen}
//         mode={mode}
//         productId={editingProduct?._id}
//         initialData={editingProduct || undefined}
//         onSuccess={handleSuccess}
//       />
//     </div>
//   );
// }
