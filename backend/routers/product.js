const  express = require('express');

const router = express.Router();

const { createProduct,getAllProducts, updateProduct,deleteProduct,getProductdetails,createProductReview, deleteReview} = require("../controller/Productinfo");
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const { updateUserRole } = require('../controller/usercontroller');

router.post("/product/new",createProduct );

router.get("/product",getAllProducts);
router.post("/auth",isAuthenticatedUser);
router.put("/admin/product/:id",updateProduct);

router.delete("/deleteproduct/:id", isAuthenticatedUser,deleteProduct);

router.get("/getProductdetails/:id",getProductdetails);

router.get("/product/:id", getProductdetails);
router.put("/updateuserrole", updateUserRole);
router.put("/review",createProductReview);

router.get("/reviews" ,isAuthenticatedUser, getProductdetails);

router.delete("/deletereview",isAuthenticatedUser,deleteReview)

module.exports = router;