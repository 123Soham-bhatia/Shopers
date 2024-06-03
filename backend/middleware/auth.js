const ErrorHandler = require("../utils/Errorhandler");
const catchAsyncErrors = require("./catchasyncerrors");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    // Extract token from cookies
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    try {
        // Verify token
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by ID
        const user = await User.findById(decodedData.id);
        
        // Check if user exists
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }
        
        // If user exists, proceed to next middleware
        next();
    } catch (error) {
        return next(new ErrorHandler("Invalid token ha ha ha ha ", 401));
    }
});

exports.authorizeRoles = (...roles) =>{
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
        return next( new ErrorHandler(
                `role: ${req.user.role}
                is not allowed to access this resource`,403
            ));
        }
        next();
    };
};
