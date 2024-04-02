const mongoose = require('mongoose');
// best practice is to store the connection string in an environment variable BUT here we are storing it in a variable for simplicity
const url = String("mongodb+srv://loaymohamed1999:c1LVvu0aBRBsgB32@cluster0.zcjszts.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
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