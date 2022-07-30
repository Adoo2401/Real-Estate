const {admin}=require("../config/firebase");


const pushNotification=(token,message)=>{

    console.log(token);
    const notificationOptions={

        priority:"high",
        timeToLive:60*60*24
    
    }

    const message_notification = {
        notification: {
           title: "Apni Jagah",
           body: message

               }
        };

    admin.messaging().sendToDevice(token,message_notification,notificationOptions).then(()=> true).catch((error)=>console.log(error));

}

module.exports=pushNotification;