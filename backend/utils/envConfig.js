// utils/envConfig.js
const path = require("path");
const dotenv = require("dotenv");

const NODE_ENV = "development";
// const NODE_ENV = "production";

const envPath = path.resolve(process.cwd(), `.env.${NODE_ENV}`);

function loadEnv() {
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.error("❌ Error loading env file:", result.error);
  } else {
    console.log(`✅ Loaded .env.${NODE_ENV}`);
  }

  return result;
}

module.exports = loadEnv;
