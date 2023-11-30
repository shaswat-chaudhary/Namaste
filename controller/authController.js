const Users = require('../models/userModel');
const sendVerification = require('../utils/emailSend');
const { hashString, createJWT, compareString } = require('../utils/index');

const register = async (req, res, next) => {

  const { firstName, lastName, email, password } = req.body;

  if ((!firstName || !lastName || !email || !password)) {
    next("Provide Required Fields!");
    return;
  }

  try {
    const userExist = await Users.findOne({ email });

    if (userExist) {
      next("Email Address already exists");
      return;
    }

    const hashedPassword = await hashString(password);

    const user = await Users.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    //send email verification to user
   
    sendVerification(user, res);
    

  } catch (error) {
    console.log(error + "error");
    res.status(404).json({ message: error.message });
  }
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {

        if (!email || !password) {
            next("please provide User credentials");
            return;
        }

        const user = await Users.findOne({ email }).select("+password").populate({
            path: "friends",
            select: "firstName lastName location profileUrl password",
        })

        if (!user) {
            next("Invaild email or pasword");
            return;
        }

        if (!user?.verifed) {
            next("Please verify your email address");
            return;
        }

        //compare password
        const isPasswordCorrect = await compareString(password, user?.password);

        if (!isPasswordCorrect) {
            next("Invaild email or password");
            return;
        }
        user.password = undefined;

        const token = createJWT(user?._id);

        res.status(201).json({
            success: true,
            message: "Login Successfully",
            user, token,
        })
    }
    catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }

}


module.exports = { register, login, sendVerification };
