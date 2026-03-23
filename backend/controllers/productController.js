const logger = require('../utils/logger');
const Product = require('../models/Product');
const Image =require('../models/Image');
const User = require('../models/User');
const Category = require('../models/Category');
const generateSlug = require('../services/generateSlugByName');
const {productregisterEmailhelper,sellerProductDeletionEmailHelper,adminProductDeletionEmailHelper} = require('../utils/product-email-helper');
const {uploadImage} = require('../services/imageUploadService');
const mongoose = require('mongoose');
const SellerProfile = require('../models/SellerProfile');

function buildProductQuery(query = {}, { includeHidden = false } = {}) {
  const filters = { ...query };

  if (!includeHidden) {
    filters.isDeleted = false;
    filters.isActive = true;
    filters.status = 'approved';
  }

  return Product.find(filters)
    .populate('categoryId', 'name description slug parentCategory')
    .populate('images', 'url publicId');
}
// get all products
const getAllProducts = async(req,res)=>{
    logger.info('get all products endpoint hit');
    try {
        const { search, categoryId } = req.query;
        const filters = {};

        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
            filters.categoryId = categoryId;
        }
        if (search) {
            filters.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        const products = await buildProductQuery(filters).sort({ createdAt: -1 });
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
        const product = await Product.findOne({
            _id: productId,
            isDeleted: false,
        })
        .populate('categoryId', 'name description slug parentCategory')
        .populate('images', 'url publicId');

        if (!product || (!product.isActive && product.status !== 'approved')) {
            logger.warn('product not found');
            return res.status(404).json({
                success: false,
                message: 'product not found',
            });
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
        const sellerProfile = await SellerProfile.findOne({ userId: req.info.userId }).select('_id approvalStatus');

        if (!sellerProfile) {
            logger.warn('seller profile not found');
            return res.status(404).json({
                success: false,
                message: 'seller profile not found',
            });
        }
        const products = await Product.find({
            sellerId: sellerProfile._id,
            isDeleted: false,
        })
        .populate('categoryId', 'name description slug parentCategory')
        .populate('images', 'url publicId')
        .sort({ createdAt: -1 });

        if(!products){
            logger.warn('products not found');
            return res.status(404).json({
                success:false,
                message:'products not found'
            })
        }
        logger.info('product fetched successfully');
        res.status(200).json({
            success:true,
            message:'fetch all products',
            products,
            sellerApprovalStatus: sellerProfile.approvalStatus,
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
    console.log(req.body)
    const {name,price,categoryId,stock} = req.body; // get basic product details
    const files = req.files || []; //get images of product
    const userId = req.info.userId; //get sellerId
    try {
        const sellerProfile = await SellerProfile.findOne({ userId }).populate('userId', 'email name');
        if (!sellerProfile) {
            logger.warn('seller profile not found');
            return res.status(404).json({ 
                success: false, 
                message: 'seller profile not found' 
            });
        }
        if (sellerProfile.approvalStatus !== 'verified') {
            logger.warn('seller account is not verified yet');
           return res.status(403).json({ 
            success: false, 
            message: 'seller account is not verified yet' 
        });
        }

        // check category existance
        const category = await Category.findById(categoryId);
        if(!category){
            logger.warn('category not found');
            return res.status(404).json({
                success:false,
                message:'category not found'
            })
        }
        const user = await User.findById(userId);
        // check user existance
        if(!user){
            logger.warn('user not found');
            return res.status(404).json({
                success:false,
                message:'user not found'
            })
        }
        const imageIds = [];
        for (const file of files) {
            console.log(file)
            const result = await uploadImage(file.path);
            console.log(result)
            const image = await Image.create({
                url: result.url,
                publicId: result.public_id,
                uploadedBy: sellerProfile._id,
            });
            imageIds.push(image._id);
        }

        const product = new Product({
            name,
            slug: generateSlug(name),
            description: req.body.description || '',
            price,
            discountPrice: req.body.discountPrice || 0,
            categoryId,
            sellerId: sellerProfile._id,
            images: imageIds,
            stock,
        });

        await product.save();
        logger.info('product registration successfully');
        await productregisterEmailhelper(user.email, user.name, name);
        res.status(201).json({
            success: true,
            message: 'product registration successfully',
            product,
        });
    } catch (error) {
        logger.error('error while creating product', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

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
        const sellerProfile = await SellerProfile.findOne({ userId: req.info.userId }).select('_id');
        const product = await Product.findById(productId);

        if (req.info.role === 'seller' && (!sellerProfile || product.sellerId.toString() !== sellerProfile._id.toString())) {
            logger.warn('You can update only your own products');
            return res.status(403).json({ 
                success: false, 
                message: 'You can update only your own products' 
            });
        }

        const updates = {};
        ['price', 'discountPrice', 'stock', 'description', 'name'].forEach((field) => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
        });

        if (updates.name) {
            updates.slug = generateSlug(updates.name);
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, updates, { new: true })
        .populate('categoryId', 'name description slug parentCategory')
        .populate('images', 'url publicId');

        logger.info('product update successfully');
        res.status(200).json({
            success: true,
            message: 'product update successfully',
            product: updatedProduct,
        });
    } catch (error) {
        logger.error('error while updating product', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' });
    }
};

// delete product
const deleteProduct = async (req, res) => {
  logger.info('delete product endpoint hit');

  const productId = req.params.id;
  const userId = req.info.userId;        // logged-in user
  const userRole = req.info.role;    // "admin" | "seller"
  const { reason } = req.body;
  try {
    const sellerProfile = await SellerProfile.findOne({ userId }).select('_id');
    const product = await Product.findById(productId).populate({
      path: 'sellerId',
      populate: {
        path: 'userId',
        select: 'name email',
      },
    });
    if (!product) {
      logger.warn('product not found');
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }


      if (userRole === 'seller') {
      if (!sellerProfile || product.sellerId._id.toString() !== sellerProfile._id.toString()) {
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