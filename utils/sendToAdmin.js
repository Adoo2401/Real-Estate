const User=require("../models/userModel");
const pusher=require("../config/pusher");

const sendToAdmin=async(message,propertyId)=>{

    await pusher.trigger('admin-notification','update-notification',{data:'update'});

    let admin=await User.find({role:"admin"});

     for(let i=0;i<admin.length;i++){

      admin[i].notifications.push({message,propertyId})
      await admin[i].save({validateBeforeSave:false})

     }

    
}

module.exports=sendToAdmin