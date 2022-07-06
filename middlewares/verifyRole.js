const responseSend=require("../utils/response");


const verifyRole=async(req,resp,next)=>{
    try {
        
        if(req.user.role==="admin"){
            next();
        }else{
            responseSend(resp,401,false,"Only Admin can access to this routes")
        }

    } catch (error) {
        
        responseSend(resp,500,false,"Something Went Wrong")

    }
}

module.exports=verifyRole