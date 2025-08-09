const { cloudinary } = require("../config/cloudinary");

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: "auto",
      ...options,
    };

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
      .end(buffer);
  });
};

// Delete from Cloudinary
const deleteFromCloudinary = (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

// Extract public_id from Cloudinary URL
const extractPublicId = (cloudinaryUrl) => {
  try {
    const urlParts = cloudinaryUrl.split("/");
    const versionIndex = urlParts.findIndex((part) => part.startsWith("v"));
    if (versionIndex !== -1 && versionIndex < urlParts.length - 1) {
      const pathAfterVersion = urlParts.slice(versionIndex + 1).join("/");
      return pathAfterVersion.replace(/\.[^/.]+$/, "");
    }
    const filename = urlParts[urlParts.length - 1];
    const folder = urlParts[urlParts.length - 2];
    return `${folder}/${filename.replace(/\.[^/.]+$/, "")}`;
  } catch (error) {
    console.error("Error extracting public_id:", error);
    return null;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
};
