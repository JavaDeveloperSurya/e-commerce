const logger = require('../utils/logger');
const Category = require('../models/Category');
const generateSlug = require('../services/generateSlugByName');
// create categoty
const createCategory = async(req,res)=>{
    logger.info('category create endpoint hit');
    const {name} = req.body;
    try {
        const data ={
        name,
        slug:generateSlug(name),
        parentCategory :req.body.parentCategory || null,
        description:req.body.description || ''
    }
    const category = new Category(data);
    await category.save();
    logger.info('category created');
    res.status(201).json({
        success:true,
        message:'category created successfully'
    })
    } catch (error) {
        logger.error('category creation failed: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

// get all categories
const getAllCategories = async(req,res)=>{
    logger.info('get all categories endpoint hit');
    try {
         const categories = await Category.find({}).populate('parentCategory','name slug');
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

// get single category
const getSingleCategory = async(req,res)=>{
    logger.info('get single category endpoint hit');
    const categoryId = req.params.id;
    try {
         const category = await Category.find({}).populate('parentCategory','name slug');
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
        res.status(401).json({
            success:true,
            message:'update category implementation in progress'
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
        res.status(401).json({
            success:true,
            message:'update category implementation in progress'
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
    updateCategory,
    deleteCategory
}