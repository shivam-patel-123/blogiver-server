const multer = require("multer");
const AWS = require("aws-sdk");

const catchAsync = require("../utils/catchAsync");

const Blog = require("../models/blogModel");
const category = require("../constants/blogCategory");
const { default: axios } = require("axios");
const { getSecrets } = require("../utils/getAWSSecrets");

const s3 = new AWS.S3();

const validateBlogCategory = (categoryToValidate) => {
    for (const currCategory in category) {
        if (category[currCategory] === categoryToValidate) {
            return category[currCategory];
        }
    }
    return category.OTHERS;
};

const upload = multer({ storage: multer.memoryStorage() });

exports.uploadBlogImage = upload.single("image");

exports.createNewBlog = catchAsync(async (req, res, next) => {
    const { blogTitle, blogContent, blogAbstract } = req.body;
    const user = req?.user;
    let file = req.file;
    const category = validateBlogCategory(req?.body?.category);

    const blog = await Blog({
        blogTitle,
        blogAbstract,
        blogContent,
        author: user._id,
        category,
        createdOn: new Date(),
    });

    const extension = file?.mimetype.split("/")[1];
    const uniqueFileName = `blog-${blog._id}.${extension}`;

    const secrets = await getSecrets();

    if (file) {
        const data = await s3
            .upload({
                Bucket: secrets.BUCKET_NAME || "blogiver-bucket-b00917152",
                Key: uniqueFileName,
                Body: file.buffer,
            })
            .promise();

        blog.image = data.Location;
    }

    await blog.save();

    const apiGatewayURL = process.env.API_GATEWAY_URL || "https://4ir8e2deb9.execute-api.us-east-1.amazonaws.com/Development";
    console.log(apiGatewayURL);

    const sendEmail = await axios.post(`${apiGatewayURL}/send-email`, {
        to: user.email,
        subject: `${blogTitle} - Blogiver`,
        message: `You have just created a new blog on Blogiver. \nBlog Title: ${blog.blogTitle}.\n Blog Abstract: ${blog.blogAbstract}. \nCategory: ${blog.category}`,
    });

    console.log(sendEmail);

    res.status(201).json({
        status: "success",
        // blog,
    });
});

exports.getAllBlogs = catchAsync(async (req, res, next) => {
    const { category } = req.query;

    let blogs;

    if (!category) {
        blogs = await Blog.find();
    } else {
        blogs = await Blog.find({ category });
    }

    console.log(blogs);

    res.status(200).json({
        status: "success",
        blogs,
    });
});

exports.getAllBlogsByUser = catchAsync(async (req, res, next) => {
    const user = req.user;

    const blogs = await Blog.find({ author: user._id });

    res.status(200).json({
        status: "success",
        blogs,
    });
});

exports.getBlogById = catchAsync(async (req, res, next) => {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);

    res.status(200).json({
        status: "success",
        blog,
    });
});

exports.deleteBlogPost = catchAsync(async (req, res, next) => {
    const { blogId } = req.params;

    const blogPost = await Blog.findById(blogId);

    const extensionArr = blogPost.image.split(".");

    const uniqueFileName = `blog-${blogId}.${extensionArr[extensionArr.length - 1]}`;

    await s3
        .deleteObject({
            Bucket: "blogiver-bucket-b00917152",
            Key: uniqueFileName,
        })
        .promise();

    const blog = await Blog.findByIdAndRemove(blogId);

    res.status(200).json({
        status: "success",
        blog,
    });
});
