const Product = require("../models/productdetails");
const ErrorHandler = require("../utils/Errorhandler");
const catchAsyncErrors = require("../middleware/catchasyncerrors");
const ApiFeatures = require("../utils/apifeatures");


// for the admin

exports.createProduct = catchAsyncErrors(async (req, res) => {
  try {
      const product = await Product.create(req.body);
      res.status(201).json({
          success: true,
          product,
      });
  } catch (error) {
      res.status(400).json({
          success: false,
          error: error.message, // or customize the error message
      });
  }
});
 // Import the ApiFeatures class

exports.getAllProducts = catchAsyncErrors(async (req, res) => {

const resultPerPage = 8;
const productCount = await Product.countDocuments();

    const apifeatures = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage);
    const products = await apifeatures.query;

    res.status(200).json({
        success: true,
        products,
    });
});

// for the admin
// ...

exports.updateProduct = catchAsyncErrors(async(req,res,next)=>{
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }
    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true, runValidators:true, useFindAndModify:false
    });

    res.status(200).json({
        success:true,
        product,
    });
});

// ...


exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
    });
});


exports.getProductdetails = catchAsyncErrors(async (req,res,next)=>{

    const product = await Product.findById(req.params.id);
    // const productCount = await product.countDocuments();

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    res.status(200).json({
        success:true,
        product,
        // productCount,

    });
});

// create new review or update the review
exports.createProductReview = catchAsyncErrors(async (req,res,next)=>{
    const {rating, comment,productId} = req.body;

    const review = {
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
      );

      if (isReviewed) {
        product.reviews.forEach((rev) => {
          if (rev.user.toString() === req.user._id.toString())
            (rev.rating = rating), (rev.comment = comment);
        });
    }
    else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }

    let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});



// get all review of a product
 exports.getProductReviews = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHandler("product not found", 404));
    }
    res.status(200).json({
        success:true,
        reviews : product.reviews
    });

 });

//  delete review
 exports.deleteReview = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.query.productId);

    if(!product)
    {
        return next(new ErrorHandler("product not found ",404));
    }

    // when we request we get a review with the review id , compare them with the id whose review you want to read, we compare them and filter one out which we don't want to delete and add them in the datebase

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
      );
    

   let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
