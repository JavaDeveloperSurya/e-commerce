const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadImageMiddleware');
const {authenticate,AdminSellerAuth,sellerAuth} = require('../middleware/authMiddleware');
const {getAllProducts,getProductById,registerProduct,getSellerProducts,updateProduct,deleteProduct,} = require('../controllers/productController');


router.get('/all',getAllProducts);
router.get('/:id',getProductById);
router.get('/seller/my-products',authenticate,sellerAuth,getSellerProducts);
router.post('/create',authenticate,sellerAuth,upload.array("images", 5),registerProduct);
router.put('/:id/update',authenticate,sellerAuth,updateProduct); 
router.put('/:id/stock',authenticate,sellerAuth,updateProduct);
router.delete('/:id/delete',authenticate,AdminSellerAuth,deleteProduct);
// product status(active,inactive)

module.exports = router;