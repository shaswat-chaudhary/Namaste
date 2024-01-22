const mongoose = require('mongoose'); 

const Schema = mongoose.Schema;
// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First Name is required'],
    },
    lastName: {
        type: String,
        required: [true, 'Last Name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
       
    },
    location: {
        type: String,
    },
    profileUrl: {
        type: String,
    },
    profession: {
        type: String,
    },
    friends: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    verifed: {
        type: Boolean,
        default: false,
    },
},
    { timestamps: true }
);

//Export the model
module.exports = mongoose.model('Users', userSchema);