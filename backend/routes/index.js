// routes/index.js - Advanced version
// routes/index.js - With better error handling
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const API_VERSION = "V1";

// Function to safely require route files
const safeRequire = (routePath) => {
  try {
    const fullPath = path.join(__dirname, routePath);
    if (fs.existsSync(fullPath + ".js")) {
      const routeModule = require(routePath);
      if (
        typeof routeModule === "function" ||
        (routeModule && typeof routeModule.use === "function")
      ) {
        return routeModule;
      } else {
        console.warn(`Route file ${routePath} does not export a valid router`);
        return null;
      }
    } else {
      console.warn(`Route file ${routePath}.js does not exist`);
      return null;
    }
  } catch (error) {
    console.error(`Error loading route ${routePath}:`, error.message);
    return null;
  }
};

// Import all route files safely
const routeModules = {
  auth: safeRequire("./auth"),
  users: safeRequire("./user"),
  account: safeRequire("./account"),
  upload: safeRequire("./upload"),
  categories: safeRequire("./category"),
  products: safeRequire("./product"),
};

// Filter out null routes
const validRoutes = Object.fromEntries(
  Object.entries(routeModules).filter(([key, value]) => value !== null)
);

// Route configuration
const routeConfig = {
  auth: {
    path: "/auth",
    route: validRoutes.auth,
    description: "Authentication and authorization endpoints",
    public: true,
  },
  users: {
    path: "/users",
    route: validRoutes.users,
    description: "User profile and management endpoints",
    protected: true,
  },
  adminAccount: {
    path: "/account",
    route: validRoutes.account,
    description: "Account settings and management endpoints",
    protected: true,
    adminOnly: true,
  },
  // upload: {
  //   path: "/upload",
  //   route: validRoutes.upload,
  //   description: "File upload and media management endpoints",
  //   protected: true,
  // },
  // categories: {
  //   path: "/categories",
  //   route: validRoutes.categories,
  //   description: "Product category management endpoints",
  //   protected: true,
  //   adminOnly: ["POST", "PUT", "DELETE"],
  // },
  products: {
    path: "/products",
    route: validRoutes.products,
    description: "Product inventory management endpoints",
    protected: true,
    adminOnly: ["POST", "PUT", "DELETE"],
  },
};

// Apply routes only if they exist
Object.entries(routeConfig).forEach(([key, config]) => {
  if (config.route) {
    router.use(config.path, config.route);
    console.log(`✓ Mounted route: ${config.path}`);
  } else {
    console.warn(
      `✗ Skipped route: ${config.path} (module not found or invalid)`
    );
  }
});

// API documentation endpoint
router.get("/routes", (req, res) => {
  const routeInfo = Object.entries(routeConfig).map(([key, config]) => ({
    name: key,
    path: `/api${config.path}`,
    description: config.description,
    version: config.version,
    protected: config.protected || false,
    public: config.public || false,
    adminOnly: config.adminOnly || null,
  }));

  res.status(200).json({
    success: true,
    message: "Available API routes",
    version: API_VERSION,
    data: {
      routes: routeInfo,
      totalRoutes: routeInfo.length,
      grouping: {
        "Authentication & Users": ["auth", "users"],
        "File Management": ["upload"],
        "Inventory Management": ["categories", "products"],
      },
    },
  });
});

// API status and information
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Inventory Management API",
    version: API_VERSION,
    endpoints: {
      documentation: "/api/routes",
      health: "/api/health",
      status: "/api/",
    },
    features: [
      "User Authentication",
      "Product Management",
      "Category Management",
      "File Upload",
      "Real-time Updates",
    ],
  });
});

// Route not found for API
router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.originalUrl} not found`,
    availableRoutes: "/api/routes",
  });
});

module.exports = router;
