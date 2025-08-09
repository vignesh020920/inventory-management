const Product = require("../models/Product");
const httpStatus = require("http-status");
const moment = require("moment");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
} = require("../utils/cloudinaryHelper");

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const inStock = req.query.inStock;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (inStock !== undefined) {
      query.inStock = inStock === "true";
    }

    // Execute query
    const products = await Product.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(httpStatus.OK).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get products",
      error: error.message,
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: "Product retrieved successfully",
      data: { product },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get product",
      error: error.message,
    });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const images = [];
    const uploadedFiles = []; // Track uploaded files for cleanup

    // Upload files to Cloudinary
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          // Upload to Cloudinary
          const uploadResult = await uploadToCloudinary(file.buffer, {
            folder: "uploads/products",
            transformation: [
              { width: 1200, height: 1200, crop: "limit" },
              { quality: "auto", fetch_format: "auto" },
            ],
          });

          uploadedFiles.push(uploadResult.public_id); // Track for cleanup

          const altText =
            req.body.imageAlts && req.body.imageAlts[i]
              ? req.body.imageAlts[i]
              : "";

          images.push({
            url: uploadResult.secure_url,
            alt: altText,
          });
        } catch (uploadError) {
          console.error(`Failed to upload image ${i}:`, uploadError);
          // Clean up already uploaded files
          await Promise.allSettled(
            uploadedFiles.map((publicId) => deleteFromCloudinary(publicId))
          );
          throw new Error(`Failed to upload image ${i + 1}`);
        }
      }
    }

    // Parse tags
    let tags = [];
    if (req.body.tags) {
      try {
        tags =
          typeof req.body.tags === "string"
            ? JSON.parse(req.body.tags)
            : req.body.tags;
      } catch (e) {
        tags = [];
      }
    }

    // Create product
    const productData = {
      name: req.body.name,
      stockQuantity: parseInt(req.body.stockQuantity) || 0,
      description: req.body.description || "",
      status: req.body.status || "active",
      images: images,
      tags: tags,
    };

    const product = new Product(productData);
    await product.save();

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Product created successfully",
      data: { product },
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Product not found",
      });
    }

    let updatedImages = [];
    const uploadedFiles = []; // Track uploaded files for cleanup

    // Handle existing images
    if (req.body.existingImages && req.body.existingImages.length > 0) {
      req.body.existingImages.forEach((imgData) => {
        try {
          const parsedImg =
            typeof imgData === "string" ? JSON.parse(imgData) : imgData;
          updatedImages.push(parsedImg);
        } catch (e) {
          console.warn("Invalid existing image data:", imgData);
        }
      });
    }

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          // Upload to Cloudinary
          const uploadResult = await uploadToCloudinary(file.buffer, {
            folder: "uploads/products",
            transformation: [
              { width: 1200, height: 1200, crop: "limit" },
              { quality: "auto", fetch_format: "auto" },
            ],
          });

          uploadedFiles.push(uploadResult.public_id);

          const altText =
            req.body.imageAlts && req.body.imageAlts[i]
              ? req.body.imageAlts[i]
              : "";

          updatedImages.push({
            url: uploadResult.secure_url,
            alt: altText,
          });
        } catch (uploadError) {
          console.error(`Failed to upload image ${i}:`, uploadError);
          // Clean up already uploaded files
          await Promise.allSettled(
            uploadedFiles.map((publicId) => deleteFromCloudinary(publicId))
          );
          throw new Error(`Failed to upload image ${i + 1}`);
        }
      }
    }

    // Parse tags
    let tags = existingProduct.tags;
    if (req.body.tags) {
      try {
        tags =
          typeof req.body.tags === "string"
            ? JSON.parse(req.body.tags)
            : req.body.tags;
      } catch (e) {
        tags = existingProduct.tags;
      }
    }

    // Prepare update data
    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.stockQuantity !== undefined)
      updateData.stockQuantity = parseInt(req.body.stockQuantity);
    if (req.body.description !== undefined)
      updateData.description = req.body.description;
    if (req.body.status !== undefined) updateData.status = req.body.status;

    updateData.images = updatedImages;
    updateData.tags = tags;

    // Find images to delete
    const oldImageUrls = existingProduct.images.map((img) => img.url);
    const newImageUrls = updatedImages.map((img) => img.url);
    const imagesToDelete = oldImageUrls.filter(
      (url) => !newImageUrls.includes(url)
    );

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // Delete removed images from Cloudinary
    if (imagesToDelete.length > 0) {
      await Promise.allSettled(
        imagesToDelete.map((url) => {
          const publicId = extractPublicId(url);
          return publicId ? deleteFromCloudinary(publicId) : null;
        })
      );
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: "Product updated successfully",
      data: { product },
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.allSettled(
        product.images.map((image) => {
          const publicId = extractPublicId(image.url);
          return publicId ? deleteFromCloudinary(publicId) : null;
        })
      );
    }

    await Product.findByIdAndDelete(id);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// const deleteFiles = (filePaths) => {
//   filePaths.forEach((filePath) => {
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }
//   });
// };

// // Create product
// const createProduct = async (req, res) => {
//   try {
//     // Process uploaded images
//     const images = [];

//     if (req.files && req.files.length > 0) {
//       req.files.forEach((file, index) => {
//         const imageUrl = `/uploads/products/${file.filename}`;
//         const altText =
//           req.body.imageAlts && req.body.imageAlts[index]
//             ? req.body.imageAlts[index]
//             : "";

//         images.push({
//           url: imageUrl,
//           alt: altText,
//         });
//       });
//     }

//     // Parse tags if it's a string
//     let tags = [];
//     if (req.body.tags) {
//       try {
//         tags =
//           typeof req.body.tags === "string"
//             ? JSON.parse(req.body.tags)
//             : req.body.tags;
//       } catch (e) {
//         tags = [];
//       }
//     }

//     // Prepare product data with only the fields from your schema
//     const productData = {
//       name: req.body.name,
//       stockQuantity: parseInt(req.body.stockQuantity) || 0,
//       description: req.body.description || "",
//       status: req.body.status || "active",
//       images: images,
//       tags: tags,
//     };

//     const product = new Product(productData);
//     await product.save();

//     res.status(httpStatus.CREATED).json({
//       success: true,
//       message: "Product created successfully",
//       data: { product },
//     });
//   } catch (error) {
//     console.log(error);
//     // Delete uploaded files if there's an error
//     if (req.files && req.files.length > 0) {
//       const filePaths = req.files.map((file) => file.path);
//       deleteFiles(filePaths);
//     }

//     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       message: "Failed to create product",
//       error: error.message,
//     });
//   }
// };

// // Update product
// const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find existing product
//     const existingProduct = await Product.findById(id);
//     if (!existingProduct) {
//       // Delete uploaded files if product doesn't exist
//       if (req.files && req.files.length > 0) {
//         const filePaths = req.files.map((file) => file.path);
//         deleteFiles(filePaths);
//       }

//       return res.status(httpStatus.NOT_FOUND).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     // Process images
//     let updatedImages = [];

//     // Handle existing images
//     if (req.body.existingImages && req.body.existingImages.length > 0) {
//       req.body.existingImages.forEach((imgData) => {
//         try {
//           const parsedImg =
//             typeof imgData === "string" ? JSON.parse(imgData) : imgData;
//           updatedImages.push(parsedImg);
//         } catch (e) {
//           console.warn("Invalid existing image data:", imgData);
//           // Skip invalid image data
//         }
//       });
//     }

//     // Handle new uploaded images
//     if (req.files && req.files.length > 0) {
//       req.files.forEach((file, index) => {
//         const imageUrl = `/uploads/products/${file.filename}`;
//         const altText =
//           req.body.imageAlts && req.body.imageAlts[index]
//             ? req.body.imageAlts[index]
//             : "";

//         updatedImages.push({
//           url: imageUrl,
//           alt: altText,
//         });
//       });
//     }

//     // Parse tags if it's a string
//     let tags = existingProduct.tags;
//     if (req.body.tags) {
//       try {
//         tags =
//           typeof req.body.tags === "string"
//             ? JSON.parse(req.body.tags)
//             : req.body.tags;
//       } catch (e) {
//         tags = existingProduct.tags;
//       }
//     }

//     // Prepare update data with only the fields from your schema
//     const updateData = {};

//     if (req.body.name !== undefined) {
//       updateData.name = req.body.name;
//     }

//     if (req.body.stockQuantity !== undefined) {
//       updateData.stockQuantity = parseInt(req.body.stockQuantity);
//     }

//     if (req.body.description !== undefined) {
//       updateData.description = req.body.description;
//     }

//     if (req.body.status !== undefined) {
//       updateData.status = req.body.status;
//     }

//     // Always update images and tags
//     updateData.images = updatedImages;
//     updateData.tags = tags;

//     // Find images to delete (images that were removed)
//     const oldImageUrls = existingProduct.images.map((img) => img.url);
//     const newImageUrls = updatedImages.map((img) => img.url);
//     const imagesToDelete = oldImageUrls.filter(
//       (url) => !newImageUrls.includes(url)
//     );

//     const product = await Product.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     // Delete removed image files from filesystem
//     imagesToDelete.forEach((imageUrl) => {
//       if (imageUrl.startsWith("/uploads/")) {
//         const filePath = path.join(__dirname, "..", imageUrl);
//         if (fs.existsSync(filePath)) {
//           fs.unlinkSync(filePath);
//           console.log(`Deleted old image: ${filePath}`);
//         }
//       }
//     });

//     res.status(httpStatus.OK).json({
//       success: true,
//       message: "Product updated successfully",
//       data: { product },
//     });
//   } catch (error) {
//     // Delete uploaded files if there's an error
//     if (req.files && req.files.length > 0) {
//       const filePaths = req.files.map((file) => file.path);
//       deleteFiles(filePaths);
//     }

//     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       message: "Failed to update product",
//       error: error.message,
//     });
//   }
// };

// // Delete product
// const deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(httpStatus.NOT_FOUND).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     // Delete associated image files
//     if (product.images && product.images.length > 0) {
//       product.images.forEach((image) => {
//         if (image.url.startsWith("/uploads/")) {
//           const filePath = path.join(__dirname, "..", image.url);
//           if (fs.existsSync(filePath)) {
//             fs.unlinkSync(filePath);
//             console.log(`Deleted image: ${filePath}`);
//           }
//         }
//       });
//     }

//     await Product.findByIdAndDelete(id);

//     res.status(httpStatus.OK).json({
//       success: true,
//       message: "Product deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete product error:", error);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       message: "Failed to delete product",
//       error: error.message,
//     });
//   }
// };

// Search products
const searchProducts = async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || query.trim() === "") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Search query is required",
      });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
    })
      .limit(parseInt(limit))
      .sort({ name: 1 });

    res.status(httpStatus.OK).json({
      success: true,
      data: { products },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to search products",
      error: error.message,
    });
  }
};

// Get product statistics
const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: "active" });
    const inactiveProducts = await Product.countDocuments({
      status: "inactive",
    });
    const discontinuedProducts = await Product.countDocuments({
      status: "discontinued",
    });
    const inStockProducts = await Product.countDocuments({ inStock: true });
    const outOfStockProducts = await Product.countDocuments({ inStock: false });

    // Products created in the last 30 days
    const thirtyDaysAgo = moment().subtract(30, "days").toDate();
    const newProducts = await Product.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Low stock products (stock quantity < 10)
    const lowStockProducts = await Product.countDocuments({
      stockQuantity: { $lt: 10, $gt: 0 },
    });

    res.status(httpStatus.OK).json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        discontinuedProducts,
        inStockProducts,
        outOfStockProducts,
        newProducts,
        lowStockProducts,
      },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get product statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductStats,
};
