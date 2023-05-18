//Importing some required modules{
const express = require("express");
const app = express();
const propertyRoutes = require("./routes/propertyRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes=require("./routes/chatRoutes");
const cors = require("cors");
const bodyParser=require("body-parser");
const expressFileToUpload=require("express-fileupload");

//}

// using main middlerwares here{
app.use(expressFileToUpload({useTempFiles:true}))
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}))
app.use("/api/v1/property", propertyRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chat",chatRoutes);

//}

module.exports = app;
