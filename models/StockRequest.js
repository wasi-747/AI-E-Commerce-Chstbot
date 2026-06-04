import mongoose from "mongoose";

const stockRequestSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId:   { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    size:        { type: String, enum: ["S", "M", "L", "XL", "XXL"], required: true },
    notifyEmail: { type: String },
    status:      { type: String, enum: ["pending", "notified", "fulfilled"], default: "pending" },
    initiatedBy: { type: String, enum: ["chatbot", "manual"], default: "chatbot" },
    requestedAt: { type: Date, default: Date.now },
    notifiedAt:  { type: Date },
  },
  { timestamps: true }
);

stockRequestSchema.index({ userId: 1 });
stockRequestSchema.index({ productId: 1, size: 1, status: 1 });

export default mongoose.models.StockRequest || mongoose.model("StockRequest", stockRequestSchema);
