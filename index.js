const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const globalErrorHandler = require("./controllers/errorController");

const app = express();
const PORT = process.env.PORT || 8003;

process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("Unhandled rejection:", err);
});

// CONNECT TO MONGODB DATABASE
const MONGO_STRING = process.env.MONGO_URI.replace("<username>", process.env.MONGO_USERNAME).replace("<password>", process.env.MONGO_PASSWORD);
mongoose.connect(MONGO_STRING);

const database = mongoose.connection;

database.on("error", (err) => {
    console.log(err);
});

database.once("connected", () => {
    console.log("===== DATABASE CONNECTION SUCCESSFUL =====");
});

app.use(express.static("public"));
app.use(express.json());
app.use(cors());

app.get("/*", (req, res, next) => {
    res.status(404).send("Page Not Found");
});

app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Blog Platform server is running on Port : ${PORT}`);
});
