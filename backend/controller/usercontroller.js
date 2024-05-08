const ErrorHandler = require("../utils/Errorhandler");
const catchAsyncErrors = require("../middleware/catchasyncerrors");
const User = require("../models/usermodel")
const sendToken = require("../utils/jwtToken")
const  sendEmail = require("../utils/sendEmail")

// register  a user 

exports.registerUser = catchAsyncErrors(async(req,res,next)=>{

    const {name,email,password} = req.body;
    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"this is a sample id",
            url:"profilepicurl",
        },
    });

   sendToken(user,201,res);
});

exports.loginUser = catchAsyncErrors(async(req,res,next)=>{
    const {email,password} = req.body;

    if(!email || ! password){
        return next (new ErrorHandler)("Please enter email and password");
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("invalid email or password",401));
    }
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("invalid email or password",401));
    }

    sendToken(user,200,res);
});

// logout data 

exports.logout = catchAsyncErrors(async(req,res,next)=>{

    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly:true,
    });

    res.status(200).json({
        success:true,
        message:"logged out",
    })
})


// forget password token
exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{

    const emailcheck = req.body.email;
const user = await User.findOne({email:emailcheck});

if(!user){
    return next(new ErrorHandler("user not found",404));
}
 const resetToken= user.getResetPasswordToken();

 await user.save({validateBeforeSave:false});


const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
)}/api/v1/password/reset/${resetToken}`;

const message = `your password reset token is :- \n\n ${resetPasswordUrl}  \n\nIf you have not requested this email, then please ignore it`;

try{
await sendEmail({
    email:user.email,
    subject:'Ecommerce password recovery',
    message,
});

res.status(200).json({
    success:true,
    message:`email sent to ${user.email} successfully`,
})

}
catch(error){
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave : false});
    
    return next(new ErrorHandler(error.message,500))
}

});

// reset password
exports.resetPassword = catchAsyncErrors(async(req,res)=>{
    // creating token hash

    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user =  await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
    });
    if(!user){
        return next(new ErrorHandler("reset password token is invalid or has been expired",400));

    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not match",400));

    }
    user.password = re.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user,200,res);


});

// get user details
 exports.getUserDetails = 
 catchAsyncErrors(async(req,res)=>{

  
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user,
    });
 });

//  update user password
exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldpassword);

    if(!isPasswordMatched ){
        return next(new ErrorHandler("old password is incorrect ",401));
    }
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match",400));
    }
    user.password = req.body.newPassword;

    await user.save();

    sendToken(user,200,res);
});

//  user details update
exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
    }
    // we will add cloudinary later

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }


    res.status(200).json({
        success:true,
        user,
    });
});

// get all users
exports.getAllUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.find();

    res.status(200).json({
        success:true,
        user,
    });
});

exports.getsingleUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`user does not exist with id: ${req.params.id}`));
    }

    res.status(200).json({
        success:true,
        user,
    });
});


// update user role 
exports.updateUserRole = catchAsyncErrors(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    }
    // we will add cloudinary later

    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }


    res.status(200).json({
        success:true,
        user,
    });
});


// delete user
exports.deleteProfile = catchAsyncErrors(async(req,res,next)=>{

    // we will add cloudinary later -- admin
const user = await User.findById(req.params.id);
// we will remove cloudinary later

if(!user){
    return next(new ErrorHandler(`user does not exist with id  ${req.params.id}`,400))
};

await user.remove();

res.status(200).json({
    success:true,
    message:` user with id ${req.params.id} is deleted successfully`,
});
   
 
});
