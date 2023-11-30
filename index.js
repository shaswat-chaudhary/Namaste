

const express = require('express');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');


require('dotenv').config();

const _dirname = path.resolve(path.dirname(""));

const PORT = process.env.PORT || 5000;

app.use(express.json());



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})


// security packages

const dbConnect = require('./config/database');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { errorHandling } = require('./middleware/errorHandling');
const router = require('./routes/index');
dbConnect();


app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));
app.use(router);


// error handling

app.use(errorHandling)


app.get('/', (req, res) => {
    res.send(`<h1>Server is running on port ${PORT}</h1>
    <h1>Welcome to Namaste</h1>
    `);
})