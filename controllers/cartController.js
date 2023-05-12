const Order = require("../models/Order");
const Cart = require("../models/Cart");
const CatchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createCart = CatchAsync(async (req, res, next) => {
  const newCart = new Cart(req.body);

  const savedCart = await newCart.save();

  res.status(200).json({
    success: true,
    savedCart,
  });
});

exports.updateCart = CatchAsync(async (req, res, next) => {
  const updatedCart = await Cart.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true }
  );
  res.status(200).json({
    success: true,
    updatedCart,
  });
});

exports.deleteCart = CatchAsync(async (req, res, next) => {
  const cart = await Cart.findByIdAndDelete(req.params.id);

  if (!cart) {
    return next(new AppError("Cart not found with this id", 404));
  }

  res.status(200).json({
    success: true,
  });
});

exports.getMyCart = CatchAsync(async (req, res, next) => {
  const cart = await Cart.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    cart,
  });
});

exports.getAllCarts = CatchAsync(async (req, res, next) => {
  const carts = await Cart.find();

  res.status(200).json({
    success: true,
    carts,
  });
});
