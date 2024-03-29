const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    select:false
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  city: {
    type: String,
  },
  registerAs: {
    type: String,
    required: true,
    default:"individual"
  },
  status:{
    type:String,
    required:true,
    default:"basic"
  },
  role:{
    type:String,
    required:true,
    default:"user"
  },
  favourites:[],
  recent:[],
  
  notifications:[

    {
        message:{
            type:String,
        },

        propertyId:{
            type:mongoose.Schema.ObjectId,
            ref:"Product",
        }, 
        
        seen:{
          type:Boolean,
          default:false
        },
    }
],

   token:{type:String},

   setting:{
    notification:{type:Boolean,required:true,default:true},
    featuredAd:{type:Boolean,required:true,default:true},
    viewAd:{type:Boolean,required:true,default:true},
   }
 
});

module.exports = mongoose.model("User", userSchema);
