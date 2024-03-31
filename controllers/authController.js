const crypto = require("crypto"); //this is a built in function basically use for generating randon strings expecially (passwordreset token)
// requiring built in util for writing async function(verification of token)
const { promisify } = require("util"); //builtin function for promifying token verification
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

// function to generate token
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });
};

// function to create and send token to client
const createAndSendToken = (user, statusCode, res) => {
  // calling signToken function to generate token
  const token = signToken(user._id);
  const cookiesOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookiesOptions.secure = true; //we only want secure option when we are in production
  // creating a cookie
  res.cookie("jwt", token, cookiesOptions);

  // removing password field when a user is signedup
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token, //sending the token to the user
    data: {
      user: user,
    },
  });
};

// signup a user
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  // calling the createAndSendToken function
  createAndSendToken(newUser, 201, res);
});

// loggin a user
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1)check if email and password exist
  if (!email || !password) {
    return next(new AppError("please provide email and password", 400));
  }

  // 2)check if user exist and password is correct
  const user = await User.findOne({ email }).select("+password"); // we are using findone instead of findbyid because we are not using id to find the user rather we are using field(e.g email) also note that we selected the password explicitely because in our model, the select was set to false
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("incorrect email or password", 401));
  }
  //   3)if everything is correct send token
  //calling createAndSendToken function
  createAndSendToken(user, 200, res);
});

// PROTECT MIDDLEWARE
exports.protect = catchAsync(async (req, res, next) => {
  // 1)Getting token and check if it exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookie.jwt;
  }
  if (!token) {
    // console.log(token);
    return next(
      new AppError("you are not logged please login to get access", 401)
    );
  }
  // 2)verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);
  // 3)check if the user accessing the route still exist
  const currentUser = await User.findById(decoded.id); //we are using findById because we use our Id as our payload in generating the token that is stored in our decoded
  if (!currentUser) {
    return next(
      new AppError(
        "The User belonging to this token does not exist anylonger",
        401
      )
    );
  }
  // 4)check if user change password after token was issued
  // calling passwordchangedAfter function from userModel
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password please login again", 401)
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

//  restrictions
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you do not have permission to perforn this action", 403)
      );
    }
    next();
  };
};

// updating password
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1)get the user from the collection
  const user = await User.findById(req.user.id).select("+password");
  // 2)check if the posted pasted password is correct
  // calling correctpassword function from usermodel
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("your current password is wrong", 401));
  }
  // 3)if so, update the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save({ validateBeforeSave: false });
  // 4)Log user in, send jwt
  // calling the createAndSendToken function
  createAndSendToken(user, 200, res);
});
