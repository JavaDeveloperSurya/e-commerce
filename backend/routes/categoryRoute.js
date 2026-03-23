const express = require('express');
const router = express.Router();
const {authenticate,adminAuth} = require('../middleware/authMiddleware');
const {createCategory,getAllCategories,getSingleCategory,updateCategory,deleteCategory} = require('../controllers/categoryController');


router.get('/categories', getAllCategories);
router.get('/category/:id', getSingleCategory);
router.post('/category', authenticate, adminAuth, createCategory);
router.put('/category/:id/update', authenticate, adminAuth, updateCategory);
router.delete('/category/:id/delete', authenticate, adminAuth, deleteCategory);

module.exports = router;