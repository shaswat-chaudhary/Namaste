
const express = require('express');
const path = require('path');
const { userAuth } = require('../middleware/authMiddle');
const { getUser, updateUser, suggestFriends, searchUsers, requestFriend, getFriendRequest, acceptFriendRequest } = require('../controller/userController');

const router = express.Router();

//user
router.get("/get-user/:id?", userAuth, getUser);
router.put("/update-user", userAuth, updateUser);

// //friend request
router.post("/friend-request", userAuth, requestFriend);
router.post("/get-friend-request", userAuth, getFriendRequest);


//accept & reject friend request
router.post("/accept-request", userAuth, acceptFriendRequest);


//search user
router.get("/search", userAuth, searchUsers);

//suggest friend
router.post("/suggest-friend", userAuth, suggestFriends)

// router.get("/verify/:userId/:token", verifyEmail);

// router.get("/verifed", (req, res) => {
//     res.sendFile(path.join(__dirname, "../views/verified.html"))
// })


module.exports = router;



  