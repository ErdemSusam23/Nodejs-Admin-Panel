require("dotenv").config(); 

module.exports = {
    CONNECTION_STRING: process.env.CONNECTION_STRING || "mongodb://mongodb:27017/nodejs"
};