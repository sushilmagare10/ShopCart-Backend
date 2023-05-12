const User = require("../models/User");
const AppError = require("../utils/appError");
const CatchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");

exports.isVerifiedUser = CatchAsync(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(
      new AppError(
        "You are not logged In! Please login to access the resorces"
      ),
      401
    );
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);

  next();
});

exports.verifyRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role :${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
