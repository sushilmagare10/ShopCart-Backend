const express = require("express");
const { isVerifiedUser, verifyRoles } = require("../middleware/Auth");
const {
  createCart,
  updateCart,
  deleteCart,
  getMyCart,
  getAllCarts,
} = require("../controllers/cartController");

const router = express.Router();

router.route("/cart/new").post(isVerifiedUser, createCart);

router.route("/update/cart").put(isVerifiedUser, updateCart);

router.route("/delete/cart/:id").delete(isVerifiedUser, deleteCart);

router.route("/my/cart").put(isVerifiedUser, getMyCart);

//admin
router
  .route("/admin/allcarts")
  .get(isVerifiedUser, verifyRoles("admin"), getAllCarts);

module.exports = router;
