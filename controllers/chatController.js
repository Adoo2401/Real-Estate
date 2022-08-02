const Chat=require("../models/chatModel");


exports.getMessages=async(req,resp)=>{
    try {

        const {to}=req.body

        let from=req.user._id.toString();

        const message= await Chat.find({users:{$all:[from,to]}}).sort({updatedAt:1});

        const projectMessages=message.map((msg)=>{
            return {
                fromSelf:msg.sender.toString()===from,
                message:msg.message.text
            }
        })

        resp.status(200).json({success:true,message:projectMessages})
        
    } catch (error) {
        
        resp.status(500).json({success:false,message:error.message});

    }
}


exports.addMessage=async(req,resp)=>{
    try {
        

        const {to,message}=req.body
        let from=req.user._id.toString();

        await Chat.create({message:{text:message},users:[from,to],sender:from});

        resp.status(201).json({success:true,message:'Messeage Sent succesfully'});
        
    } catch (error) {
        
        resp.status(500).json({success:false,message:error.message});

    }
}