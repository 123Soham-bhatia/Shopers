const Order = require("../models/orderModel");
const ErrorHandler = require("../utils/Errorhandler");
const catchAsyncErrors = require("../middleware/catchasyncerrors");
const Product = require("../models/productdetails");


// create a new error
exports.newOrder =  catchAsyncErrors(async(req,res,next)=>{
    const {shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,} = req.body;

        const order = await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paidAt: Date.now(),
            user: req.user._id,
          });

          res.status(201).json({
            success: true,
            order,
          });
        });

// get logged in user order
exports.getSingleOrder =  catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate("user" , "name email");
    // this line tells that user is  a reffered thing in Order so this is the way in which the populate calls not the whole user info but the name and the email

    if(!order){
        return next(new ErrorHandler("order not found with this id ",404));
    }
        res.status(200).json({
            success:true,
order,
        });
    
});

// get logged in user orders
exports.myOrders =  catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.find({user: req.user._id});
      
        res.status(200).json({
            success:true,
             order,
        });
});

// get all orders --- admin
exports.getAllOrders = catchAsyncErrors(async(req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;
    
    orders.forEach((orders) => {
        totalAmount += orders.totalPrice; // Remove the comma after this line
    });
      
    res.status(200).json({
        success: true,
        orders,
        totalAmount  // Optionally include totalAmount in the response
    });
});


// update order status ---admin
// ...

exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHander("Order not found with this Id", 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHander("You have already delivered this order", 400));
    }

    if (req.body.status === "Shipped") {
        order.orderItems.forEach(async (o) => {
            await updateStock(o.product.toString(), o.quantity);
        });
    }
    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
    });
});

async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.Stock -= quantity;

    await product.save({ validateBeforeSave: false });
}


// delete that one out
exports.deleteOrder = catchAsyncErrors(async(req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    await order.remove();
          
    res.status(200).json({
        success: true,
         // Optionally include totalAmount in the response
    });
});
