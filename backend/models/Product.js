const mongoose = require("mongoose");
const { Schema } = mongoose;
const productSchema = new Schema(
{
    name: {
      type: String,
      required: true,
      text: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    description: {
      type: String,
      text: true
    },

    price: {
      type: Number,
      required: true
    },

    discountPrice: Number,

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true
    },

    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "SellerProfile",
      required: true
    },

    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image"
      }
    ],

    stock: {
      type: Number,
      default: 0
    },

    ratingAverage: {
      type: Number,
      default: 0,
      index: true
    },

    ratingCount: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true
    },
    isActive: {
      type: Boolean,
      default:false
    },
    isDeleted:{
      type:Boolean,
      default:false
    },
    deletedAt:Date,
    deletedBy:String,
    deletionReason:String
},
{ timestamps: true }
);
productSchema.index({ sellerId: 1, isActive: 1 }); // seller products
productSchema.index({ category: 1, isActive: 1 }); // category filter
productSchema.index({ price: 1 });                 // price sorting
productSchema.index({ name: "text", description: "text" }); // search
module.exports = mongoose.model("Product", productSchema);