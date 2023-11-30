const express = require('express');
const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const postRouter = require('./postRouter');

const router = express.Router();


router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/posts', postRouter);


module.exports = router;