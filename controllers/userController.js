const User = require("../models/userModel");
const responseSend = require("../utils/response");
const bcrypt=require("bcrypt");
const validator=require("validator");
const jsonwebtoken=require("jsonwebtoken");

// To register the user{

exports.RegisterUser = async (req, resp) => {
  
try {

    let {password,email,name,phone,city,registerAs}=req.body;

    const checkEmail=await User.findOne({email});

    if(checkEmail){
      return responseSend(resp,500,false,'Email Already Exist')
    }
    
    if(!password || !email || !name || !phone){
     return  responseSend(resp,500,false,"Please Enter all Fields")
    }

    if(!validator.isEmail(email)){
     return  responseSend(resp,500,false,"Please Enter A vallid Email");
    }

    if(!validator.isLength(password,{min:8,max:15})){
      return responseSend(resp,500,false,"Password Should be minimun 8 characters and maximun 15")
    }

    password=await bcrypt.hash(password,10);

    const user=await User.create({email,password,name,phone,city,registerAs})

    //Creating a json Web Token

    const token=jsonwebtoken.sign({id:user._id},process.env.JWT_SECRET,{
      expiresIn:process.env.JWT_EXPIRE
    })

  
    responseSend(resp,201,true,{token,user});
    
  } catch (error) {
    responseSend(resp, 500, false, error);
  }
};

//}


//Login User {


exports.loginUser=async(req,resp)=>{
  try {

   

    if(!req.body.email || !req.body.password){
      return responseSend(resp,500,false,"Please Enter All Fields");
    }

    if(!validator.isEmail(req.body.email)){
      return  responseSend(resp,500,false,"Please Enter A vallid Email");
     }

    

    const user=await User.findOne({email:req.body.email}).select("+password").clone();
    

    if(!user){
     return responseSend(resp,500,false,"Email And Password are Incorrect");
    }


    const hashPass=await bcrypt.compare(req.body.password,user.password);

    

    const token=jsonwebtoken.sign({id:user._id},process.env.JWT_SECRET,{
      expiresIn:process.env.JWT_EXPIRE
    })


    if(hashPass){
     return resp.status(201).json({
        user,
        token,
        code:201
      })
    }

    responseSend(resp,200,false,"Email And Password Are Incorrect");

    
  } catch (error) {
    responseSend(resp, 500, false, error);
  }
}


//}


//LogOut User {

  exports.logoutUser = async (req, resp) => {
    resp
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      })
      .json({
        success: true,
        message: "Log out successfully",
      });
  };

//}