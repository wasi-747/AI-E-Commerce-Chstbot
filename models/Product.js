import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: "" },
    shortDescription: { type: String, default: "" }, // ≤80 chars — injected into LLM catalog context
    category: {
      type: String,
      enum: ["t-shirts", "pants", "accessories", "outerwear", "dresses", "shirts"],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    tags: { type: [String], default: [] }, // e.g. ["running", "nike", "athletic", "cotton"]
    inventory: {
      S:   { type: Number, default: 0, min: 0 },
      M:   { type: Number, default: 0, min: 0 },
      L:   { type: Number, default: 0, min: 0 },
      XL:  { type: Number, default: 0, min: 0 },
      XXL: { type: Number, default: 0, min: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ name: "text", tags: "text", shortDescription: "text" });
productSchema.index({ category: 1 });
productSchema.index({ tags: 1 });

export default mongoose.models.Product || mongoose.model("Product", productSchema);
