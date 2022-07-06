const mongoose = require("mongoose");

const connectDatabase = async () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("mongo connected"))
    .catch((error) => console.log(error));
};

module.exports = connectDatabase;
