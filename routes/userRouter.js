
const express = require('express');
const path = require('path');
const { userAuth } = require('../middleware/authMiddle');
const { verifyEmail, getUser, updateUser, profileViews, suggestFriends, requestFriend, getFriendRequest, acceptFriendRequest, searchUsers } = require('../controller/userController');

const router = express.Router();

//user
router.get("/get-user/:id?", userAuth, getUser);
router.put("/update-user", userAuth, updateUser);

//friend request
router.post("/friend-request", userAuth, requestFriend);
router.post("/get-friend-request", userAuth, getFriendRequest);


//accept & reject friend request
router.post("/accept-request", userAuth, acceptFriendRequest);


//search user
router.post("/search", userAuth, searchUsers);


//view profile
router.post("/profile-view", userAuth, profileViews);

//suggest friend
router.post("/suggest-friend", userAuth, suggestFriends)

router.get("/verify/:userId/:token", verifyEmail);

router.get("/verifed", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/verified.html"))
})


module.exports = router;



  