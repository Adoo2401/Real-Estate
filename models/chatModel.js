const mongoose=require("mongoose");

const messageSchema=new mongoose.Schema({

    message:{

        text:{
            type:String,
            requried:true,

        },
    },
        users:Array,

        sender:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },

        show:Array
    
},{timestamps:true})

module.exports=mongoose.model('Chat',messageSchema);