const Order = require("../models/Order");
const Product = require("../models/Product");
const CatchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

//create order
exports.newOrder = CatchAsync(async (req, res, next) => {
  const newOrder = new Order(req.body);

  const savedOrder = await newOrder.save();

  res.status(201).json({
    success: true,
    savedOrder,
  });
});

exports.getSingleOrder = CatchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new AppError("Order not found with this ID", 400));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getMyOrders = CatchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.getAllOrders = CatchAsync(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.amount;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

exports.updateOrder = CatchAsync(async (req, res, next) => {
  const order = await Order.find(req.params.id);

  if (order.orderStatus === "Delivered") {
    return next(new AppError("You have alredy delivered this order", 404));
  }

  order.orderItems.forEach(async (order) => {
    await updateStock(order.Product, order.quantity);
  });

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,

    order,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

exports.getDeleteOrder = CatchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    return next(new AppError("Order not found with this id", 404));
  }

  res.status(200).json({
    success: true,
  });
});

exports.monthlyIncome = CatchAsync(async (req, res, next) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  const income = await Order.aggregate([
    { $match: { createdAt: { $gte: previousMonth } } },
    {
      $project: {
        month: { $month: "$createdAt" },
        sales: "$amount",
      },
    },
    {
      $group: {
        _id: "$month",
        total: { $sum: "$sales" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    income,
  });
});
