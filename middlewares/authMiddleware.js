const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const { getSecrets } = require("../utils/getAWSSecrets");

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    console.log(token);

    if (!token) {
        return next(new AppError("You are not logged in.", 401));
    }

    const secrets = await getSecrets();

    const tokenData = await promisify(jwt.verify)(token, secrets.JWT_TOKEN_SECRET);

    const user = await User.findOne({
        email: tokenData.email,
    });
    if (!user) {
        return next(new AppError("The account no longer exist.", 401));
    }

    req.user = user;
    next();
});
