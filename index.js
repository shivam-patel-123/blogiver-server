const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const userRouter = require("./routes/userRoutes");
const blogRouter = require("./routes/blogRoutes");
const globalErrorHandler = require("./controllers/errorController");
const { getSecrets } = require("./utils/getAWSSecrets");

const app = express();
const PORT = process.env.PORT || 8003;

process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("Unhandled rejection:", err);
});

// CONNECT TO MONGODB DATABASE
getSecrets().then((secrets) => {
    const MONGO_STRING = secrets.MONGO_URI.replace("<username>", secrets.MONGO_USERNAME).replace("<password>", secrets.MONGO_PASSWORD);
    mongoose.connect(MONGO_STRING);
});

const database = mongoose.connection;

database.on("error", (err) => {
    console.log(err);
});

database.once("connected", () => {
    console.log("===== DATABASE CONNECTION SUCCESSFUL =====");
});

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/blog", blogRouter);

app.get("/*", (req, res, next) => {
    res.status(404).send("Page Not Found");
});

app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Blog Platform server is running on Port : ${PORT}`);
});
