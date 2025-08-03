// models/Product.js
const mongoose = require("mongoose");

// Sub-schema: Product Image
const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
    },
    alt: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },

    stockQuantity: {
      type: Number,
      required: [true, "Please provide stock quantity"],
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },

    // Images
    images: [imageSchema],

    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Tag cannot exceed 50 characters"],
      },
    ],

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    status: {
      type: String,
      enum: ["active", "inactive", "discontinued"],
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook: auto-update inStock flag
productSchema.pre("save", function (next) {
  this.inStock = this.stockQuantity > 0;
  next();
});

// Indexes for better performance
productSchema.index({ name: "text", description: "text" });
productSchema.index({ stockQuantity: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
