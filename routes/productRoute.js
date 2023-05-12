const express = require("express");
const {
  getAllProducts,
  createProducts,
  updateProduct,
  deleteProduct,
  getSingleProduct,
} = require("../controllers/productController");
const { isVerifiedUser, verifyRoles } = require("../middleware/Auth");

const router = express.Router();

router.route("/products").get(isVerifiedUser, getAllProducts);

router.route("/product/:id").get(isVerifiedUser, getSingleProduct);

//admin
router
  .route("/admin/product/new")
  .post(isVerifiedUser, verifyRoles("admin"), createProducts);

router
  .route("admin/product/:id")
  .put(isVerifiedUser, verifyRoles("admin"), updateProduct)
  .delete(isVerifiedUser, verifyRoles("admin"), deleteProduct);

module.exports = router;
