const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getSingleUser,
  updatePassword,
  updateProfile,
  getUserdetails,
  getAllUsers,
  getMonthlyUsers,
} = require("../controllers/userController");
const { isVerifiedUser, verifyRoles } = require("../middleware/Auth");

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/password/forget").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(logout);

router.route("/profile").get(isVerifiedUser, getUserdetails);

router.route("/password/update").put(isVerifiedUser, updatePassword);

router.route("/profile/update").put(isVerifiedUser, updateProfile);

//Admin
router
  .route("/admin/users")
  .get(isVerifiedUser, verifyRoles("admin"), getAllUsers);
router
  .route("/admin/user/:id")
  .get(isVerifiedUser, verifyRoles("admin"), getSingleUser);
router
  .route("/admin/users/stats")
  .get(isVerifiedUser, verifyRoles("admin"), getMonthlyUsers);

module.exports = router;
