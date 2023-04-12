const User = require("../models/userModel");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");

const cookie = require("../constants/cookies");
const AppError = require("../utils/appError");
const { getSecrets } = require("../utils/getAWSSecrets");
// const { ConfigurationServicePlaceholders } = require("aws-sdk/lib/config_service_placeholders");

exports.sendCookie = (key, value, options, res) => {
    if (!options.maxAge) {
        getSecrets().then((secrets) => {
            console.log(secrets);
            options.maxAge = process.env.JWT_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        });
    }
    res.cookie(key, value, options);
};

exports.createAndSendToken = async (data, res) => {
    const secrets = await getSecrets();
    console.log(secrets);

    const token = jwt.sign(data, secrets.JWT_TOKEN_SECRET, {
        expiresIn: process.env.JWT_TOKEN_EXPIRY,
        // expires: new Date(Date.now() + 3600000),
    });

    this.sendCookie(
        cookie.KEY,
        token,
        {
            // httpOnly: true,
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

    // const token = await this.createAndSendToken(
    //     {
    //         email: user.email,
    //         _id: user._id,
    //     },
    //     res
    // );

    res.status(201).json({
        status: "success",
        // token,
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

    // const token = await this.createAndSendToken({ email, _id: user._id }, res);

    res.status(200).json({
        status: "success",
        // token,
        user,
    });
});

exports.validateSession = catchAsync(async (req, res, next) => {
    const token = req.cookies?.jwt;

    const secrets = await getSecrets();
    console.log(token);

    const tokenData = await promisify(jwt.verify)(token, secrets.JWT_TOKEN_SECRET);

    const user = await User.findById(tokenData._id);

    this.sendCookie(cookie.KEY, token, { httpOnly: true }, res);

    res.status(200).json({
        status: "success",
        token,
        user,
    });
});

exports.logout = (req, res, next) => {
    res.clearCookie(cookie.KEY);

    res.status(200).json({
        status: "success",
    });
};
