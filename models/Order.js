import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId:  { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name:       { type: String, required: true },  // snapshot
  imageUrl:   { type: String },                  // snapshot
  price:      { type: Number, required: true },  // snapshot — never recalculate
  size:       { type: String, required: true },
  quantity:   { type: Number, required: true, min: 1 },
  lineTotal:  { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true }, // e.g. "TDJ-20260604-0001"
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items:       { type: [orderItemSchema], required: true },
    pricing: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, default: 60 },
      total:    { type: Number, required: true },
    },
    status:    { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "confirmed" },
    placedVia: { type: String, enum: ["chatbot", "direct"], default: "chatbot" },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
