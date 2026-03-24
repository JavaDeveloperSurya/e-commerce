const logger = require('./utils/logger');
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const helmet=require('helmet');
const connectDb = require('./config/db');
const cloudinaryConfig = require('./config/cloudinary');
const morganMiddleware = require('./middleware/loggerMiddleware');
const ddosProtection = require('./middleware/ddosProtection');
const rateLimit = require('./middleware/rateLimiting');
const errorhandler = require('./middleware/errorHandling');
require('./listeners/orderListener');
// routes import
const authRoutes = require('./routes/authRoute');
const userProfileRoutes = require('./routes/userProfileRoute');
const sellerProfileRoutes = require('./routes/sellerRoute');
const adminRoutes = require('./routes/adminRoute');
const categoryRoutes = require('./routes/categoryRoute');
const productRoutes = require('./routes/productRoute');
const cartRoutes = require('./routes/cartRoute');
const wishlistRoutes = require('./routes/wishlistRoute');
const orderRoutes = require('./routes/orderRoute');
const paymentRoutes = require('./routes/paymentRoute');
const reviewRoutes = require('./routes/reviewRoute');

const app = express();
const PORT = process.env.PORT;

// Connect to MongoDB
connectDb();

// Configure Cloudinary
cloudinaryConfig();

// middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// request logging 
app.use(morganMiddleware);

// health check 
app.get('/api/health', (req,res)=>{
    res.status(200).json({
        success:true,
        message:'Server is healthy'     
    });
});


// routes
app.use('/api/auth',ddosProtection,rateLimit,authRoutes);
app.use('/api/users',ddosProtection,rateLimit,userProfileRoutes);
app.use('/api/seller',sellerProfileRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/admin',categoryRoutes);
app.use('/api/product',productRoutes);
app.use('/api/users/carts',cartRoutes);
app.use('/api/users/wishlists',wishlistRoutes);
app.use('/api/shopease',ddosProtection,orderRoutes);
app.use('/api/shopease/',ddosProtection,rateLimit,paymentRoutes);
app.use('/api/reviews',reviewRoutes);

// global error handler
app.use(errorhandler);

// server listing
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});