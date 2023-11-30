
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId, ref: "Users"
    },
    description: {
        type: String,
        require: true,
    },
    image: {
        type: String,
    },
    likes: [{
        type: String,
    }],
    comments: [{
        type: Schema.Types.ObjectId, ref: "Comment"
    }],
},
    { timestamps: true }

)

module.exports = mongoose.model("Post", postSchema)