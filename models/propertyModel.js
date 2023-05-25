const mongoose = require("mongoose");

//creating Model for property data{

const propertySchema = new mongoose.Schema({
  purpose: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  propertyType: {
    type: String,
    required: true,
    lowercase:true
  },

  propertySubType: {
    type: String,
    lowercase:true
  },

  city: {
    type: String,
    required: true,
    lowercase:true
  },

  location: {
    type:{type:String,required:true},
    address:{type:String,required:true},
    coordinates:[]
  },

  propertyTitle: {
    type: String,
    required: true,
    lowercase:true
  },

  propertyDescription: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  landAreaNumber: {
    type: Number,
    required: true,
  },
  landAreaUnit: {
    type: String,
    required: true,
    lowercase:true
  },

  bedroom: {
    type: Number,
    default:0
  },

  bathroom: {
    type: Number,
    default:0
  },

  superHot: {
    type: Boolean,
    default: false,
  },

  trusted: {
    type: Boolean,
    default: false,
    
  },

  status:{
    type:String,
    default:"active"
  },

  verified: {
    type: Boolean,
    default: false,
  },

  added: {
    type: Date,
    default: Date.now(),
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],

  views:[],
  clicks:[],
  calls:[],

  situation:{
    type:String,
    required:true,
    enum:['idle','sold','rent'],
    default:"idle",  
  }
});
//}

 propertySchema.index({location:'2dsphere'});


module.exports = mongoose.model("Property", propertySchema);
