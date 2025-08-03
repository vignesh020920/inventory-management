// utils/fileUtils.js
const generateFileUrl = (filename, type) => {
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  return `${baseUrl}/uploads/${type}/${filename}`;
};

module.exports = {
  generateFileUrl,
};
