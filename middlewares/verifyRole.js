const responseSend=require("../utils/response");


const verifyRole=async(req,resp,next)=>{
    try {

        let role=req.user.role;

        if(role==="admin"){
            next();
        }else{
            responseSend(resp,401,false,"Only Admin can access to this routes")
        }

    } catch (error) {
        
        responseSend(resp,500,false,error.message)

    }
}

module.exports=verifyRole