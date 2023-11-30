const bcrypt = require('bcrypt');

const JWT = require('jsonwebtoken');

const hashString = async (useValue) => {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(useValue, salt);
    return hashedPassword;
}

const compareString = async (userPassword, password) => {
    const isMatch = await bcrypt.compare(userPassword, password);
    return isMatch;
  };


// Create Token for User

function createJWT(id) {
    return JWT.sign({ userId: id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
  }

module.exports = { hashString, compareString, createJWT };