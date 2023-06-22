const express = require("express");
const app = express();
const propertyRoutes = require("./routes/propertyRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes=require("./routes/chatRoutes");
const multer = require("multer");
const cors = require("cors");
const verifyToken = require("./middlewares/verifyToken");
const { addProperty } = require("./controllers/propertyController");


app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cors());

const ALLOWED_FORMATS=['image/jpeg','image/png','image/jpg'];
let fileTypeCheck=false;
let fileSizeCheck = false;

const storage=multer.memoryStorage();
const upload=multer({
  storage,
  limits:{fileSize:5*1024*1024},
  fileFilter:function(req,file,cb){
          if(ALLOWED_FORMATS.includes(file.mimetype)){
            cb(null,true);                                                 
          }else{
            fileTypeCheck=true;
            cb(new Error("Not Supported File Type"),false);
          }
  }
})

const singleUpload=upload.array("picture");
const singleUploadCtrl=(req,resp,next)=>{
  singleUpload(req,resp,(error)=>{
    if (error) {
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
          fileSizeCheck = true;
          return resp.status(422).json({ success: false, message: 'Please add images less than 5mb', error });
        }
        return resp.status(422).json({
          success: false,
          message: fileTypeCheck ? 'Upload only jpg, jpeg, png files' : 'Image Upload Failed',
          error: error
        });
      }
      next();
  })
}

app.post("/addProperty",singleUploadCtrl,verifyToken,addProperty);

app.use("/api/v1/property", propertyRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chat",chatRoutes);

//}

module.exports = app;
