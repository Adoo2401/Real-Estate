const User=require("../models/userModel");
const Property=require("../models/propertyModel");

const sendNotification=async(user,notification)=>{

    let propertyUser=await User.findById(user);
    
    propertyUser.notifications.push(notification);
    
    await propertyUser.save();
   
    }

module.exports=sendNotification;