const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required!"],
        unique: true,
    },
    firstName: {
        type: String,
        required: [true, "First Name is required!"],
    },
    lastName: {
        type: String,
        required: [true, "Last Name is required!"],
    },
    password: {
        type: String,
        required: [true, "Password is must to keep account secure."],
        select: false,
        minLength: 8,
    },
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.checkPassword = async function (plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = mongoose.model("User", userSchema);
