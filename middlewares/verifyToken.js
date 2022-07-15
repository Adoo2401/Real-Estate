const responseSend=require("../utils/response");
const jwt=require("jsonwebtoken");
const User=require("../models/userModel");

const verifyToken=async(req,resp,next)=>{

 try {

    
    const token=req.headers['authorization'];

    if(!token){

        return responseSend(resp,500,false,"Please Log in To access this route");
        
    }

    jwt.verify(token,process.env.JWT_SECRET,async(err,valid)=>{
        if(err){
            return responseSend(resp,401,false,"Authorizaion Failed");
        }else{
            req.user=await User.findById(valid.id);
            next();
        }
    });

    

 } catch (error) {
    responseSend(resp,500,false,error.message)
 }
    
}



module.exports=verifyToken;