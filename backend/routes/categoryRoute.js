const express = require('express');
const router = express.Router();
const {authenticate,adminAuth} = require('../middleware/authMiddleware');
const {createCategory,getAllCategories,getSingleCategory,updateCategory,deleteCategory} = require('../controllers/categoryController');


router.use(authenticate,adminAuth);
router.post('/category',createCategory);
router.get('/categories/all',getAllCategories);
router.get('/category/:id',getSingleCategory);
router.put('/category/:id/update',updateCategory);
router.delete('/category/:id/delete',deleteCategory); 

module.exports = router;