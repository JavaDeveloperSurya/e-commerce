const mongoose = require("mongoose");
const { Schema } = mongoose;
const categorySchema = new Schema(
{
  name: {
    type: String,
    required: true,
    index: true
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },

  description: String,
  isActive: {
    type: Boolean,
    default:true
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);