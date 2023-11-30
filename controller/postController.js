
const Post = require("../models/postModel");
const Users = require("../models/userModel");
const Comment = require('../models/commentModel');


const createPost = async (req, res, next) => {

    try {

        const { userId } = req.body.user;
        const { description, image } = req.body;

        if (!description) {
            next("You must provide a description");
            return;
        }

        const post = await Post.create({
            userId,
            description,
            image,
        });

        res.status(200).json({
            success: true,
            message: "Post create Successfully",
            data: post,
        })

    } catch (error) {
        console.log(error);
        res.status(404).json({
            message: error.message,
            success: false
        })
    }
}

const getPosts = async (req, res, next) => {

    try {
        const { userId } = req.body.user;
        const { search } = req.body;

        const user = await Users.findById(userId);
        const friends = user?.friends?.toString().split(",") ?? [];
        friends.push(userId);

        const searchPostQuery = {
            $or: [
                {
                    description: { $regex: search, $options: "i" },
                },
            ],
        };

        const posts = await Post.find(search ? searchPostQuery : {})
            .populate({
                path: "userId",
                select: "firstName lastName location profileUrl password",
            })
            .sort({ _id: -1 });

        const friendsPosts = posts?.filter((post) => {
            return friends.includes(post?.userId?._id.toString());
        });

        const otherPosts = posts?.filter(
            (post) => !friends.includes(post?.userId?._id.toString())
        );

        let postsRes = null;

        if (friendsPosts?.length > 0) {
            postsRes = search ? friendsPosts : [...friendsPosts, ...otherPosts];
        } else {
            postsRes = posts;
        }

        res.status(200).json({
            sucess: true,
            message: "successfully",
            data: postsRes,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};

const getPost = async (req, res, next) => {

    try {
        const { id } = req.params;

        const post = await Post.findById(id).populate({
            path: "userId",
            select: "firstName lastName location profileUrl password",
        });

        res.status(200).json({
            success: true,
            message: "Post get Successfully",
            data: post,
        })

    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message })
    }
}

const getUserPost = async (req, res, next) => {

    try {
        const { userId } = req.body.user;

        const posts = await Post.find({ userId }).populate({
            path: "userId",
            select: "firstName lastName location profileUrl password",
        }).sort({ _id: -1 });

        res.status(200).json({
            success: true,
            message: "Post get Successfully",
            data: posts,
        })

    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message })
    }

}

const getComments = async (req, res, next) => {

    try {
        const { postId } = req.params;

        const postComment = await Comment.find({ postId }).populate({
            path: "userId",
            select: "firstName lastName location profileUrl password",
        }).populate({
            path: "replies.userId",
            select: "firstName lastName location profileUrl password",
        }).sort({ _id: -1 });

        res.status(200).json({
            success: true,
            message: "Comment post Successfully",
            data: postComment,
        })

    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message })
    }
}

const commentPost = async (req, res, next) => {
    try {
        const { comment, from } = req.body;
        const { userId } = req.body.user;
        const { id } = req.params;

        if (comment === null) {
            return res.status(404).json({ message: "Comment is required." });
        }

        const newComment = new Comment({ comment, from, userId, postId: id });

        await newComment.save();

        //updating the post with the comments id
        const post = await Post.findById(id);

        post.comments.push(newComment._id);

        const updatedPost = await Post.findByIdAndUpdate(id, post, {
            new: true,
        });

        res.status(201).json(newComment);
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};

const likePost = async (req, res, next) => {

    try {
        const { userId } = req.body.user;
        const { id } = req.params;

        const post = await Post.findById(id);

        const index = post.likes.findIndex((pid) => pid === String(userId));

        if (index === -1) {
            post.likes.push(userId);

        }
        else {
            post.likes = post.likes.filter((pid) => pid !== String(userId));
        }

        const newPost = await Post.findByIdAndUpdate(id, post, {
            new: true,

        })

        res.status(200).json({
            success: true,
            message: "Post like Successfully",
            data: newPost,
        })


    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message })
    }
}

const likePostComment = async (req, res, next) => {
    const { userId } = req.body.user;
    const { id, rid } = req.params;

    try {
        if (rid === undefined || rid === null || rid === `false`) {
            const comment = await Comment.findById(id);

            const index = comment.likes.findIndex((el) => el === String(userId));

            if (index === -1) {
                comment.likes.push(userId);
            } else {
                comment.likes = comment.likes.filter((i) => i !== String(userId));
            }

            const updated = await Comment.findByIdAndUpdate(id, comment, {
                new: true,
            });

            res.status(201).json(updated);
        } else {
            const replyComments = await Comment.findOne(
                { _id: id },
                {
                    replies: {
                        $elemMatch: {
                            _id: rid,
                        },
                    },
                }
            );

            const index = replyComment?.replies[0]?.likes.findIndex(
                (i) => i === String(userId)
            );

            if (index === -1) {
                replyComments.replies[0].likes.push(userId);
            } else {
                replyComments.replies[0].likes = replyComments.replies[0]?.likes.filter(
                    (i) => i !== String(userId)
                );
            }

            const query = { _id: id, "replies._id": rid };

            const updated = {
                $set: {
                    "replies.$.likes": replyComments.replies[0].likes,
                },
            };

            const result = await Comment.updateOne(query, updated, { new: true });

            res.status(201).json(result);
        }
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};


const replyComment = async (req, res, next) => {

    const { comment, replyAt, from } = req.body;
    const { userId } = req.body.user;
    const { id } = req.params;

    if (comment === null) {
        return res.status(404).json({ message: "comment is required" });
    }

    try {

        const commentInfo = await Comment.findById(id);

        commentInfo.replies.push({
            comment,
            replyAt,
            from,
            userId,
            create_At: Date.now()
        });

        commentInfo.save();

        res.status(200).json({
            success: true,
            message: "Comment Reply Successfully",
            data: commentInfo,
        });

    }
    catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message })
    }
}

const deletePost = async (req, res, next) => {

    try {
        const { id } = req.params;

        await Post.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Delete post Successfully",
        });

    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message })
    }
}


module.exports = { createPost, getComments, likePost, commentPost, replyComment, deletePost, likePostComment, getPosts, getUserPost, getPost };

