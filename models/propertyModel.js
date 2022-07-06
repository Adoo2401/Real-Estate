const mongoose = require("mongoose");

//creating Model for property data{

const propertySchema = new mongoose.Schema({
  purpose: {
    type: String,
    required: true,
    trim: true,
  },

  propertyType: {
    type: String,
    required: true,
  },

  propertySubType: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },

  location: {
    type:{type:String,required:true},
    address:{type:String,required:true},
    coordinates:[]
  },

  propertyTitle: {
    type: String,
    required: true,
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
  },

  bedroom: {
    type: Number,
  },

  bathroom: {
    type: Number,
  },

  superHot: {
    type: Boolean,
    default: false,
  },

  trusted: {
    type: Boolean,
    default: false,
    
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
  image:{

    type:String,
    default:"https://i.pinimg.com/originals/e0/6e/6a/e06e6a5e3936e5700401656a8285c8ee.jpg"

  }


  
  //images and the user added by will be added later
});
//}

propertySchema.index({location:'2dsphere'});

module.exports = mongoose.model("Property", propertySchema);
