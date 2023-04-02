const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");

const cookie = require("../constants/cookies");
const AppError = require("../utils/appError");

exports.sendCookie = (key, value, options, res) => {
    if (!options.maxAge) {
        options.maxAge = process.env.JWT_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    }
    res.cookie(key, value, options);
};

exports.createAndSendToken = (data, res) => {
    const token = jwt.sign(data, process.env.JWT_TOKEN_SECRET, {
        expiresIn: process.env.JWT_TOKEN_EXPIRY,
    });

    this.sendCookie(
        cookie.KEY,
        token,
        {
            httpOnly: true,
        },
        res
    );

    return token;
};

exports.createNewAccount = catchAsync(async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;

    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
    });

    user.password = undefined;

    const token = this.createAndSendToken(
        {
            email: user.email,
            _id: user._id,
        },
        res
    );

    res.status(201).json({
        status: "success",
        token,
        user,
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Email and Password is requried!", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password entered", 401));
    }

    const token = this.createAndSendToken({ email, _id: user._id }, res);

    res.status(200).json({
        status: "success",
        token,
        user,
    });
});
