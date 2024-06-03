const express = require("express");
const router = express.Router();

const {registerUser,loginUser,logout, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUser,getsingleUser,updateUserRole,deleteProfile} = require("../controller/usercontroller");
const {isAuthenticatedUser,authorizeRoles} = require("../middleware/auth")

router.get("/admin/users", getAllUser); 
// here is isAuthkind a thing......

// check this with admin role defined in it
router.put("/profile/update",updateProfile);
router.post("/register",registerUser);
router.post("/loginUser",loginUser);
router.get("/logout",logout);
router.post("/password/forgot",forgotPassword);


router.put("/password/reset/:token", resetPassword);
router.put("/password/update",isAuthenticatedUser,updatePassword)
router.get("/getuserDetails",getUserDetails);


router.get("/admin/users/:id", isAuthenticatedUser,authorizeRoles("admin"),getsingleUser);

router.put("/updateuserRole/:id",updateUserRole);

router.delete("/deleteuser/:id", deleteProfile);

module.exports = router;