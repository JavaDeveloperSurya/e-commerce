const mongoose = require("mongoose");
const { Schema } = mongoose;
const sellerProfileSchema = new Schema(
{
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true
    },

    shopName: {
        type: String,
        required: true,
        index: true
    },

    shopDescription: String,

    businessAddress: String,

    bankDetails: {
        accountNumber: String,
        ifscCode: String,
        bankName: String
    },

    approvalStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
        index: true
    },
    avg_rating: Number,
    total_reviews: Number,
    isBlocked:{
        type:Boolean,
        default:false
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("SellerProfile", sellerProfileSchema);