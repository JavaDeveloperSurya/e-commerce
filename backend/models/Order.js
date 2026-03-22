const mongoose = require("mongoose");
const { Schema } = mongoose;
const orderSchema = new Schema(
{
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product"
      },

      sellerId: {
        type: Schema.Types.ObjectId,
        ref: "SellerProfile"
      },

      quantity: Number,
      price: Number
    }
  ],

  totalAmount: {
    type: Number,
    required: true
  },

  orderStatus: {
    type: String,
    enum: ["created",
      "pending_payment",
      "payment_failed",
      "paid",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled"],
    default: "created",
    index: true
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },

  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  }
},
{ timestamps: true }
);
orderSchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model("Order", orderSchema);