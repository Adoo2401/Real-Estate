const admin=require("firebase-admin");


const pushNotification=(token,message)=>{

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

    admin.messaging().sendToDevice(token,message_notification,notificationOptions).then(()=> true).catch((error)=>error);

}

module.exports=pushNotification;