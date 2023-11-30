
const express = require('express');
const { userAuth } = require('../middleware/authMiddle');
const { createPost, getComments, likePost, commentPost, replyComment, deletePost, likePostComment, getPosts, getPost, getUserPost } = require('../controller/postController');

const router = express.Router();

//create post
router.post("/create-post", userAuth, createPost);

//getPost
router.post("/", userAuth, getPosts);
router.post("/:id", userAuth, getPost);
router.post("/get-user-post/:id", userAuth,  getUserPost);

//get Comment
router.get("/comment/:postId", getComments);

//like and comment on posts
router.post("/like/:id", userAuth, likePost);
router.post("/like-comment/:id/:rid?", userAuth, likePostComment);
router.post("/comment/:id", userAuth, commentPost);
router.post("/reply-comment?:id", userAuth, replyComment);


//delete post
router.delete("/:id", userAuth, deletePost);


module.exports = router;