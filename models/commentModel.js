const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const commentSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId, ref: "Users"
    },
    postId: {
        type: Schema.Types.ObjectId, ref: 'Post'
    },
    comment: {
        type: String,
        require: true,
    },
    from: {
        type: String,
        required: true,
    },
    replies: [{
        rid: { type: mongoose.Schema.Types.ObjectId },
        userId: { type: Schema.Types.ObjectId, ref: 'Users' },
        from: { type: String, required: true },
        replyAt: { type: String },
        createAt: { type: String },
        updatedAt: { type: String },
        likes: [{ type: String }],
    }],
    likes: [{ type: String }],
},

    { timestamps: true }

)

module.exports = mongoose.model("Comment", commentSchema)