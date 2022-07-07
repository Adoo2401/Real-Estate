//importing some usefull modules{

const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");

//}

//creating path for dotenv to access variables{

dotenv.config({ path: "./config/config.env" });

//}

//connecting database mongodb{

connectDatabase();

//}

//Createing the server here{
app.listen(process.env.PORT,"192.168.1.2", () => {
  console.log(`server is working on ${process.env.PORT}`);
});
//}
