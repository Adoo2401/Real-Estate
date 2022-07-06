const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select:false
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
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
  }

 
});

module.exports = mongoose.model("User", userSchema);
