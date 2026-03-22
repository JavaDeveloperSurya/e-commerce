const mongoose = require("mongoose");
const { Schema } = mongoose;
const adminSchema = new Schema(
{
    email: {
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },

    role: {
        type: String,
        default: "admin",
        index: true
    },
},
{ timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);