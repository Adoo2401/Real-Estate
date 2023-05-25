require("dotenv").config({path:"./config/config.env"})
const app = require("./app");
const connectDatabase = require("./config/database");
const cloudinary=require("cloudinary");

connectDatabase();

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
})


app.listen(process.env.PORT,"192.168.12.16",() => {
  console.log(`server is working on ${process.env.PORT}`);
});

