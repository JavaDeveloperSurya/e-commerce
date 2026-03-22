const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema(
{
    name: {
        type: String,
        trim: true,
        index: true
    },

    email: {
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },

    role: {
        type: String,
        enum: ["buyer", "seller", "admin"],
        default: "buyer",
        index: true
    },

    phone: String,

    addresses: [
        {
            label: String,
            street: String,
            city: String,
            landMark:String,
            state: String,
            country: String,
            postalCode: String,
            _id:false
        }
    ],
    
    isProfileCompleted: {
        type: Boolean,
        default: false
    },

    isBlocked: {
        type: Boolean,
        default: false
    },
},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);