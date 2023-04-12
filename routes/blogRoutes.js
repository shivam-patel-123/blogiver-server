const express = require("express");

const { createNewBlog, getAllBlogs, getAllBlogsByUser, getBlogById, deleteBlogPost, uploadBlogImage, saveBlogImage } = require("../controllers/blogController");
// const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(getAllBlogs);
// router.route("/user").get(protect, getAllBlogsByUser);
router.route("/user/:id").get(getAllBlogsByUser);
router.route("/:blogId").get(getBlogById);

// router.use(protect);

router.route("/").post(uploadBlogImage, createNewBlog);
router.route("/user").get(getAllBlogsByUser);
router.route("/:blogId").delete(deleteBlogPost);

module.exports = router;
