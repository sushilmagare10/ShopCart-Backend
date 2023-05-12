const CatchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// create token and save it in cookie
const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  // options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  //removing password from the res
  user.password = undefined;

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

exports.registerUser = CatchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  sendToken(user, 201, res);
});

exports.loginUser = CatchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if the user has given both email and password
  if (!email || !password) {
    return next(new AppError("Please Enter Email & Password", 401));
  }

  //check if user exists & password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  sendToken(user, 200, res);
});

exports.logout = CatchAsync(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

exports.forgotPassword = CatchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // get resetpassword token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // reset link
  const resetPasswordURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your Password Reset Token is:-\n\n ${resetPasswordURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Elemart Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError(error.message, 500));
  }
});

exports.resetPassword = CatchAsync(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  //seraching user using the token

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError("Reset Password Token is invalid or has been expired", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new AppError("Password does not match", 400));
  }

  //saving new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

exports.getUserdetails = CatchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    succes: true,
    user,
  });
});

exports.updatePassword = CatchAsync(async (req, res, next) => {
  // get user from database
  const user = await User.findById(req.user.id).select("+password");

  // check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong", 400));
  }

  if (req.body.newPassword !== user.password) {
    return next(new AppError("password does not match", 400));
  }

  // update password
  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

exports.updateProfile = CatchAsync(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    succes: true,
  });
});

exports.getAllUsers = CatchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

exports.getSingleUser = CatchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError(`User does not  with id ${req.params.id}`, 400));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

exports.getMonthlyUsers = CatchAsync(async (req, res, next) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  const data = await User.aggregate([
    { $match: { createdAt: { $gte: lastYear } } },
    {
      $project: {
        month: { $month: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$month",
        total: { $sum: 1 },
      },
    },
  ]);
  res.status(200).json({
    success: true,
    data,
  });
});
