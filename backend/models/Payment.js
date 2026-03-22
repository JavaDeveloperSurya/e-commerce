const mongoose = require("mongoose");
const { Schema } = mongoose;
const paymentSchema = new Schema(
{
  orderId: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: true,
    index: true
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  paymentMethod: {
    type: String,
    enum: ["UPI", "Card", "COD"],
    default : "COD"
  },

  transactionId: {
    type: String,
    index: true
  },

  amount: Number,

  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending"
  },

  paidAt: Date
},
{ timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);