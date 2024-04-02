const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config()

// TODO: change to your DB connection string here
const url = String(process.env.MONGODB_URL);
async function connectToDb() {
    await mongoose.connect(url);
    console.log("Connected to db");
}

// close connection to the database
async function closeDbConnection() {
    await mongoose.connection.close();
    console.log("Connection to db closed");
}

// export the function
module.exports = {
    connectToDb,
    closeDbConnection,
};