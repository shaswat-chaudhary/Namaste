const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const { hashString } = require('./index')
const Verification = require('../models/emailVerification');


dotenv.config();

const { APP_URL, AUTH_EMAIL, AUTH_PASSWORD } = process.env;

let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    auth: {
        user: AUTH_EMAIL,
        pass: AUTH_PASSWORD,
    }
})

const sendVerification = async (user, res) => {

    const { _id, email, firstName } = user;

    const token = _id + uuidv4();

    const link = APP_URL + '/users/verify/' + _id + "/" + token;


    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: "Email Verification",
        html: `<div style='font-family: Arial, sans-serif; font-size: 20px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;'>
        <h3 style="color: rgb(8, 56, 188)">Please verify your email address</h3>
        <hr>
        <h4>Hi ${firstName},</h4>
        <p>
            Please verify your email address so we can know that it's really you.
            <br>
        <p>This link <b>expires in 1 hour</b></p>
        <br>
        <a href=${link} style="color: #fff; padding: 14px; text-decoration: none; background-color: #000;  border-radius: 8px; font-size: 18px;">
        Verify Email Address</a>
        </p>
        <div style="margin-top: 20px;">
            <h5>Best Regards</h5>
            <h5>Namaste India</h5>
        </div>
    </div>`,
    }

    try {

        const hashedToken = await hashString(token);

        const newVerification = await Verification.create({
            userId: _id,
            token: hashedToken,
            createAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        });

        if (newVerification) {
            transporter
                .sendMail(mailOptions)
                .then(() => {
                    res.status(201).send({
                        success: "PENDING",
                        message:
                            "Verification email has been sent to your account. Check your email for further instructions.",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(404).json({ message: "Something went wrong" });
                });
        }

    }

    catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message })
    }
}

module.exports = sendVerification;