const Product = require("../models/Product");
const CatchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiFeatures = require("../utils/apiFeatures");

exports.createProducts = CatchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

exports.getAllProducts = CatchAsync(async (req, res, next) => {
  const resultPerPage = 10;
  const countProducts = await Product.countDocuments();

  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter();

  let products = await apiFeatures.query.clone();

  let filteredProducts = products.length;

  apiFeatures.pagination(resultPerPage);
  products = await apiFeatures.query;

  res.status(200).json({
    success: true,
    products,
    countProducts,
    resultPerPage,
    filteredProducts,
  });
});

exports.updateProduct = CatchAsync(async (req, res, next) => {
  let product = Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not Found", 404));
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.deleteProduct = CatchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError("Product not Found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Product has been deleted",
  });
});

exports.getSingleProduct = CatchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not Found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});
