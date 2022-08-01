const User=require("../models/userModel");

const sendToAdmin=async(message,propertyId)=>{

    let admin=await User.find({role:"admin"});

     for(let i=0;i<admin.length;i++){

      admin[i].notifications.push({message,propertyId})
      await admin[i].save()

     }
}

module.exports=sendToAdmin