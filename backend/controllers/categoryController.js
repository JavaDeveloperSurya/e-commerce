const logger = require('../utils/logger');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const generateSlug = require('../services/generateSlugByName');
// create categoty
const createCategory = async (req, res) => {
  logger.info('category create endpoint hit');
  const { name } = req.body;
  try {
    const category = new Category({
      name,
      slug: generateSlug(name),
      parentCategory: req.body.parentCategory || null,
      description: req.body.description || '',
    });
    await category.save();
    logger.info('category created');
    res.status(201).json({
        success:true,
        message:'category created successfully',
        category 
    })
    } catch (error) {
        logger.error('category creation failed: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const fetchCategories = async ({ includeInactive = false } = {}) => {
    const filters = includeInactive ? {} : { isActive: true };
    return Category.find(filters).populate('parentCategory', 'name slug').sort({ name: 1 });
};
// get all categories
const getAllCategories = async(req,res)=>{
    logger.info('get all categories endpoint hit');
    try {
          const categories = await fetchCategories();
            if(!categories){
                logger.warn('category not found');
                return res.status(404).json({
                    success:false,
                    message:'category not found'
                })
            }
        res.status(200).json({
            success:true,
            message:'fetch categories',
            categories
        })
    } catch (error) {
        logger.error('error while fetching get all categories: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}
const getAllCategoriesForAdmin = async(req,res)=>{
    logger.info('get all categories for admin endpoint hit');
    try {
          const categories = await fetchCategories({ includeInactive: true });
        res.status(200).json({
            success:true,
            message:'fetch categories',
            categories
        })
    } catch (error) {
        logger.error('error while fetching admin categories: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}
// get single category
const getSingleCategory = async(req,res)=>{
    logger.info('get single category endpoint hit');
    const categoryId = req.params.id;
    try {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ success: false, message: 'invalid category id' });
        }
         const category = await Category.findById(categoryId).populate('parentCategory', 'name slug');
        if(!category){
            logger.warn('category not found');
            return res.status(404).json({
                success:false,
                message:'category not found'
            })
        }
        res.status(200).json({
            success:true,
            message:'fetch categories',
            category
        })
    } catch (error) {
        logger.error('error while fetching single category: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

// update category
const updateCategory = async(req,res)=>{
    logger.info('update category endpoint hit');
    const categoryId = req.params.id;
    try {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ success: false, message: 'invalid category id' });
        }
        const updates = {};
            ['name', 'description', 'parentCategory', 'isActive'].forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
            });
            if (updates.name) updates.slug = generateSlug(updates.name);
            const category = await Category.findByIdAndUpdate(categoryId, updates, { new: true }).populate('parentCategory', 'name slug');
         if (!category) {
            logger.warn('category not found');
            return res.status(404).json({
                success:true,
                message:'category not found'
            })
        }
        logger.inf0('category updated successfully');
        res.status(200).json({
            success:true,
            message:'category updated successfully',
            category
        })
    } catch (error) {
        logger.error('category updation failed: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

// delete category
const deleteCategory = async(req,res)=>{
    logger.info('delete category endpoint hit');
    const categoryId = req.params.id;
    try {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            logger.warn('invalid category id');
            return res.status(400).json({ 
                success: false, 
                message: 'invalid category id' 
            });
        }
        const category = await Category.findByIdAndDelete(categoryId);
        if (!category) {
            logger.warn('category not found');
            return res.status(404).json({ 
                success: false, 
                message: 'category not found' 
            });
        }
        logger.info('category deleted successfully');
        res.status(200).json({
            success:true,
            message:'category deleted successfully'
        })

    } catch (error) {
        logger.error('category deletion failed: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    getAllCategoriesForAdmin,
    updateCategory,
    deleteCategory
}