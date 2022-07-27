//importing some usefull modules{

const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");
const cloudinary=require("cloudinary");

//}

//creating path for dotenv to access variables{

dotenv.config({ path: "./config/config.env" });

//}

//connecting database mongodb{

connectDatabase();

//}

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
})


//Createing the server here{
app.listen(process.env.PORT, () => {
  console.log(`server is working on ${process.env.PORT}`);
});
//}
