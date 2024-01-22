
const mongoose = require('mongoose');
const Verification = require('../models/emailVerification');
const Users = require('../models/userModel')
const { compareString, createJWT, hashString } = require('../utils/index');
const FriendRequest = require('../models/friendRequest');


const verifyEmail = async (req, res) => {
    const { userId, token } = req.params;

    try {
        const result = await Verification.findOne({ userId });

        if (result) {
            const { expiresAt, token: hashedToken } = result;

            if (expiresAt < Date.now()) {
                Verification.findOneAndDelete({ userId })
                    .then(() => {
                        Users.findOneAndDelete({ _id: userId })
                            .then(() => {
                                const message = "Verification token has expired.";
                                res.redirect(`/users/verified?status=error&message=${message}`);
                            })
                            .catch((err) => {
                                console.log(err);
                                res.redirect(`/users/verified?status=error&message=`);
                            });
                    })
                    .catch((error) => {
                        console.log(error);
                        res.redirect(`/users/verified?message=`);
                    });

            }

            else {
                //token valid
                compareString(token, hashedToken)

                    .then((isMatch) => {

                        if (isMatch) {
                            Users.findByIdAndUpdate({ _id: userId }, { verifed: true })
                                .then(() => {
                                    Verification.findOneAndDelete({ userId })
                                        .then(() => {
                                            const message = "Email verified successfully";
                                            res.redirect(
                                                `/users/verifed?status=success&message=${message}`
                                            );
                                        });
                                })
                                .catch((err) => {
                                    console.log(err);
                                    const message = "Verification failed or link is invalid";
                                    res.redirect(
                                        `/users/verified?status=error&message=${message}`
                                    );
                                });
                        } else {
                            // invalid token
                            const message = "Verification failed or link is invalid";
                            res.redirect(`/users/verified?status=error&message=${message}`);
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        res.redirect(`/users/verified?message=`);
                    });
            }
        } else {
            const message = "Invalid verification link. Try again later.";
            res.redirect(`/users/verified?status=error&message=${message}`);
        }
    } catch (error) {
        console.log(err);
        res.redirect(`/users/verified?message=`);
    }
};


const getUser = async (req, res, next) => {

    try {
        const { userId } = req.body.user;
        const { id } = req.params;
        const user = await Users.findById(id ?? userId).populate({
            path: "friends",
            select: "-password",
        });

        if (!user) {
            return res.status(200).send({ message: "User does not exist", success: false });
        }
        user.password = undefined;

        res.status(200).json({ user: user, success: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", success: false });

    }
}


const updateUser = async (req, res, next) => {
    try {
        const { firstName, lastName, location, profession, profileUrl } = req.body;

        if (!firstName || !lastName || !location || !profession || !profileUrl) {
            next("Please fill all the fields");
            return;
        }
        const { userId } = req.body.user;

        const updateUser = { firstName, lastName, location, profession, profileUrl, _id: userId };

        const user = await Users.findByIdAndUpdate(userId, updateUser, { new: true });

        await user.populate({ path: "friends", select: "-password" });
        const token = createJWT(user?._id);

        user.password = undefined;

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user,
            token,
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", success: false });

    }
}


const requestFriend = async (req, res, next) => {

    try {
        const { userId } = req.body.user;

        const { requestTo } = req.body;

        const requestExist = await FriendRequest.findOne({
            requestFrom: userId,
            requestTo,
        });

        if (requestExist) {
            next("Request already sent");
            return;

        }

        const accountExist = await FriendRequest.findOne({
            requestFrom: requestTo,
            requestTo: userId,
        });

        if (accountExist) {
            next("Request already sent");
            return;
        }

        const newRes = await FriendRequest.create({
            requestTo,
            requestFrom: userId,
        });

        res.status(200).json({ success: true, message: "Request sent successfully" });


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
}


const getFriendRequest = async (req, res, next) => {

    try {

        const { userId } = req.body.user;

        const request = await FriendRequest.find({
            requestTo: userId,
            requestStatus: "Pending",
        }).populate({
            path: "requestFrom",
            select: "firstName lastName profileUrl profession password",
        }).limit(10).sort({
            _id: -1,
        });

        res.status(200).json({ success: true, data: request });

    }

    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
}


const acceptFriendRequest = async (req, res, next) => {

    try {
        const id = req.body.user.userId;

        const { rid, status } = req.body;

        const request = await FriendRequest.findById(rid);

        if (!request) {
            next("Request not found");
            return;
        }

        const newRes = await FriendRequest.findByIdAndUpdate(
            { _id: rid },
            { requestStatus: status },
        )

        if (status === "accepted") {
            const user = await Users.findById(id);

            user.friends.push(newRes?.requestFrom);

            await user.save();

            const friend = await Users.findById(newRes?.requestFrom);

            friend.friends.push(newRes?.requestTo);

            await friend.save();
        }


        res.status(201).json({
            success: true,
            message: "Friend Request " + status,
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
}


const rejectFriendRequest = async (req, res, next) => {

    try {
        const { userId } = req.body.user;

        const { requestId } = req.body;

        const request = await FriendRequest.findOneAndUpdate(
            { _id: requestId, requestTo: userId },
            { requestStatus: "rejected" },
            { new: true }
        );

        if (!request) {
            next("Request not found");
            return;
        }

        res.status(200).json({ success: true, message: "Request rejected successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
}


const suggestFriends = async (req, res, next) => {

    try {

        const { userId } = req.body.user;

        let queryObject = {};

        queryObject._id = { $ne: userId };

        queryObject.friends = { $nin: userId };

        let queryResult = Users.find(queryObject).limit(15).select("firstName lastName profileUrl profession password");

        const suggestFriends = await queryResult;

        res.status(200).json({
            success: true,
            data: suggestFriends,
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", success: false });

    }
}


const searchUsers = async (req, res, next) => {

    try {
        const { userId } = req.body.user;

        const { search } = req.query;

        const users = await Users.find({
            _id: { $ne: userId },
            $or: [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
            ],
        }).select("firstName lastName profileUrl");

        res.status(200).json({ success: true, users });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
}



module.exports = { verifyEmail, compareString, getUser, updateUser, suggestFriends, searchUsers, requestFriend, getFriendRequest, acceptFriendRequest, rejectFriendRequest };