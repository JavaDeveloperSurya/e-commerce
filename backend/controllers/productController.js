const logger = require('../utils/logger');
const Product = require('../models/Product');
const Image =require('../models/Image');
const User = require('../models/User');
const Category = require('../models/Category');
const generateSlug = require('../services/generateSlugByName');
const productregisterEmailhelper = require('../utils/product-email-helper');
const {uploadImage} = require('../services/imageUploadService');
const mongoose = require('mongoose');
const SellerProfile = require('../models/SellerProfile');

// get all products
const getAllProducts = async(req,res)=>{
    logger.info('get all products endpoint hit');
    try {
        const products = await Product.find({}).populate('categoryId','name description');
        if(!products){
            logger.warn('products not found');
            return res.status(404).json({
                success:false,
                message:'products not found'
            })
        }
        res.status(200).json({
            success:true,
            message:'fetch all products',
            products
        })
    } catch (error) {
        logger.error('error while creating product');
        res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

// get single product by id
const getProductById = async(req,res)=>{
    logger.info('get single product endpoint hit');
    const productId = req.params.id;
    try {
        const product = await Product.findById(productId).populate('categoryId','name description');
        if(!product){
            logger.warn('products not found');
            return res.status(404).json({
                success:false,
                message:'products not found'
            })
        }
        res.status(200).json({
            success:true,
            message:'fetch all products',
            product
        })
    } catch (error) {
        logger.error('error while creating product');
        res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

// const get seller products
const getSellerProducts = async(req,res)=>{
    logger.info('get single product endpoint hit');
    const productId = req.params.id;
    try {
        const product = await Product.findById(productId).populate('categoryId','name description');
        if(!product){
            logger.warn('products not found');
            return res.status(404).json({
                success:false,
                message:'products not found'
            })
        }
        res.status(200).json({
            success:true,
            message:'fetch all products',
            product
        })
    } catch (error) {
        logger.error('error while creating product');
        res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}
// create product
const registerProduct = async(req,res)=>{
    logger.info('register product endpoint hit');
    const {name,price,categoryId,stock} = req.body; // get basic product details
    const files = req.files; //get images of product
    const userId = req.info.userId; //get sellerId
    try {
        const sellerId = await SellerProfile.findById(userId).select('_id');
        // check category existance
        const category = await Category.findById(categoryId);
        if(!category){
            logger.warn('category not found');
            return res.status(404).json({
                success:false,
                message:'category not found'
            })
        }
        const user = await User.findById(sellerId);
        // check user existance
        if(!user){
            logger.warn('user not found');
            return res.status(404).json({
                success:false,
                message:'user not found'
            })
        }
        let imageIds = [];
        // upload all images one by one
        for (let file of files) {
        // Upload to Cloudinary 
        const result = await uploadImage(file.path);

        // Save in DB
        const image = await Image.create({
            url: result.url,
            publicId: result.public_id,
            uploadedBy: sellerId
        });

        imageIds.push(image._id);
        }
        const data = {
            name,
            slug:generateSlug(name),
            description:req.body.description ||'',
            price,
            discountPrice: req.body.discountPrice || 0,
            categoryId,
            sellerId,
            images:imageIds,
            stock
        }
        const product = new Product(data);
        await product.save();
        logger.info('product registration successfully');
        await productregisterEmailhelper(user.email, user.name, name);
        res.status(201).json({
            success:true,
            message:'product registration successfully',
        })
    } catch (error) {
        logger.error('error while creating product');
        res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

// update product
const updateProduct = async(req,res)=>{
    try {
        const productId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            logger.warn("invalid product id");
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }
        const product = await Product.findById(productId)
            .populate({
                path: "sellerId",
                populate: {
                    path: "userId",
                    select: "name email"
                }
            });
        const data={
            price:req.body.price || product.price,
            discountPrice:req.body.discountPrice || product.discountPrice,
            stock:req.body.stock || product.stock,
            description:req.body.description || product.description
        }
        const updatedProduct = await product.findByIdAndUpdate(productId,data,{new:true});
        logger.warn('update product failed')
        if(!updatedProduct) {
            return res.status(400).json({
                success:false,
                message:'updation failed'
            })
        }
        res.status(200).json({
            success:true,
            message:'product update successfully',
        })
    } catch (error) {
        logger.error('error while updating product');
        res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

// delete product
const deleteProduct = async (req, res) => {
  logger.info('delete product endpoint hit');

  const productId = req.params.id;
  const userId = req.info.userId;        // logged-in user
  const userRole = req.info.role;    // "admin" | "seller"
  const { reason } = req.body;
  try {
    const sellerId = await SellerProfile.findById(userId).select('_id');
    const product = await Product.findById(productId);
    if (!product) {
      logger.warn('product not found');
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // SELLER OWNERSHIP CHECK
    if (userRole === "seller") {
      if (!product.sellerId) {
        logger.error('product missing sellerId field');
        return res.status(500).json({
          success: false,
          message: 'Product data integrity issue'
        });
      }

      if (product.sellerId.toString() !== sellerId.toString()) {
        logger.warn('seller trying to delete another seller product');
        return res.status(403).json({
          success: false,
          message: 'You can delete only your own products'
        });
      }
    }

    // SOFT DELETE
    product.isDeleted = true;
    product.deletedAt = new Date();
    product.deletedBy = userRole;
    product.deletionReason = reason || null;
    product.isActive = false;

    await product.save();

    logger.info(`product deleted by ${userRole}`);
    if(userRole === 'seller'){
        await sellerProductDeletionEmailHelper(product.sellerId.userId.email,product.sellerId.userId.name,product.name);
    }
    else if(userRole === 'admin'){
        await adminProductDeletionEmailHelper(product.sellerId.userId.email,product.sellerId.userId.name,product.name,reason);
    }
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: product
    });

  } catch (error) {
    logger.error('error while deleting product', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


module.exports = {
    getAllProducts,
    getProductById,
    getSellerProducts,
    registerProduct,
    updateProduct,
    deleteProduct
}