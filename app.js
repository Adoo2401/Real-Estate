//Importing some required modules{
const express = require("express");
const app = express();
const propertyRoutes = require("./routes/propertyRoutes");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const cookie_parser=require("cookie-parser");
//}

// using main middlerwares here{
app.use(express.json());
app.use(cors());
app.use(cookie_parser())
app.use("/api/v1", propertyRoutes);
app.use("/api/v1", userRoutes);
//}

module.exports = app;
