const mongoose = require('mongoose');

require('dotenv').config();

const dbConnect = async () => {
    mongoose.connect(process.env.DATABASE_URL, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
    })

        .then(() => console.log("Database Connection is Successfully"))
        .catch((error) => {
            console.log("Issue in Database Connection");
            console.error(error.message);
            process.exit(1);
        })

};

module.exports = dbConnect;