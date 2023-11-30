const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passwordResetSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
    },
    token: String,
    createAt: Date,
    expiresAt: Date,
})

module.exports = mongoose.model("PasswordReset", passwordResetSchema);