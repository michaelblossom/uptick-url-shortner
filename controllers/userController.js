const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// USER HANDLLERS
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  // sending response
  res.status(200).json({
    status: "success",
    result: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      User: user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
