const Chat=require("../models/chatModel");
const User=require("../models/userModel");
const Pusher=require("pusher");


let pusher=new Pusher({
    appId:"1456926",
    key:"e0d345cf5234e5e06e52",
    secret:"ab02bb526e6eb9d3683b",
    cluster:"ap2",
})

exports.getMessages=async(req,resp)=>{
    try {

        const {to}=req.body

        let from=req.user._id.toString();

        const message= await Chat.find({users:{$all:[from,to]}}).sort({updatedAt:1});

        const projectMessages=message.map((msg)=>{
            return {
                fromSelf:msg.sender.toString()===from,
                message:msg.message.text,
                date:msg.createdAt
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

        let channel=from+to
        

        await Chat.create({message:{text:message},users:[from,to],sender:from});

        await pusher.trigger(channel,'message',{hi:channel})

        resp.status(201).json({success:true,message:'Messeage Sent succesfully'});

        
    } catch (error) {
        
        resp.status(500).json({success:false,message:error.message});

    }
}

exports.getSingle=async(req,resp)=>{

    try {

        let array=[];

        let check=await Chat.find({user:{$in:[req.user._id]}});
   
        for(let i=0;i<check.length;i++){

        let s=check[i].users.filter((elm)=>{
            return elm!==req.user._id.toString();
        })

        array.push(s[0]);

        }

        var uniqueArray = [];
        
        for(i=0; i < array.length; i++){
            if(uniqueArray.indexOf(array[i]) === -1) {
                uniqueArray.push(array[i]);
            }
        }

        let final=[];

        for(let i=0;i<uniqueArray.length;i++){

         
         let chat=await Chat.findOne(({users:{$in:[uniqueArray[i]]}})).sort({updatedAt:-1})
          
         let userDetail=await User.findById(uniqueArray[i]);
         

          final.push({
             message:chat.message.text,
            user:userDetail.name,
            _id:userDetail._id,
          });

        }

        resp.status(200).json({success:true,message:final})
        
    } catch (error) {
        resp.status(500).json({success:false,message:error.message});
    }
}