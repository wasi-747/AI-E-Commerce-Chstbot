import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["t-shirts", "pants"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  inventory: {
    S: {
      type: Number,
      default: 0,
    },
    M: {
      type: Number,
      default: 0,
    },
    L: {
      type: Number,
      default: 0,
    },
    XL: {
      type: Number,
      default: 0,
    },
    XXL: {
      type: Number,
      default: 0,
    },
  },
});

export default mongoose.models.Product || mongoose.model("Product", productSchema);
