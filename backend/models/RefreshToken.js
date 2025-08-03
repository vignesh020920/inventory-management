const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: 604800, // 7 days in seconds
    },
    createdByIp: String,
    revokedAt: Date,
    revokedByIp: String,
    replacedByToken: String,
  },
  {
    timestamps: true,
  }
);

// Index for better performance
refreshTokenSchema.index({ userId: 1 });

// Virtual for checking if token is active
refreshTokenSchema.virtual("isActive").get(function () {
  return !this.revokedAt && !this.isExpired;
});

// Virtual for checking if token is expired
refreshTokenSchema.virtual("isExpired").get(function () {
  return Date.now() >= this.expiresAt;
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
