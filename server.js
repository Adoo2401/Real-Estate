//importing some usefull modules{

require("dotenv").config({path:"./config/config.env"})
const app = require("./app");
const connectDatabase = require("./config/database");
const cloudinary=require("cloudinary");

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
app.listen(process.env.PORT,"192.168.1.5",() => {
  console.log(`server is working on ${process.env.PORT}`);
});
//}
