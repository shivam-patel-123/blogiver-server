const { default: mongoose } = require("mongoose");
const category = require("../constants/blogCategory");

const blogSchema = new mongoose.Schema(
    {
        blogTitle: {
            type: String,
            required: [true, "Blog title is required."],
        },
        blogAbstract: {
            type: String,
            required: [true, "Short abstract is required"],
            maxLength: 300,
        },
        blogContent: {
            type: String,
            required: [true, "Blog must have content"],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        category: {
            type: String,
            enum: [category.ENTERTAINMENT, category.SPORT, category.TECHNICAL, category.EDUCATIONAL, category.NEWS, category.NATURE, category.OTHERS],
            default: category.OTHERS,
        },
        createdOn: {
            type: Date,
            required: [true, "Created Date is required"],
        },
        image: {
            type: String,
            default: "https://blogiver-bucket.s3.amazonaws.com/car-default.jpg",
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

blogSchema.pre(/^find/, function (next) {
    this.populate({
        path: "author",
    });
    next();
});

module.exports = mongoose.model("Blog", blogSchema);
