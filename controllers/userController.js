const User = require("../models/userModel");
const responseSend = require("../utils/response");
const bcrypt=require("bcrypt");
const validator=require("validator");
const jsonwebtoken=require("jsonwebtoken");
const Property=require("../models/propertyModel");
const { ObjectID } = require("bson");

// To register the user{

exports.RegisterUser = async (req, resp) => {
  
try {

    let {password,email,name,phone,city,registerAs}=req.body;

    const checkEmail=await User.findOne({email});

    if(checkEmail){
      return responseSend(resp,500,false,'Email Already Exist')
    }
    
    if(!password || !email || !name || !phone){
     return  responseSend(resp,500,false,"Please Enter all Fields")
    }

    if(!validator.isEmail(email)){
     return  responseSend(resp,500,false,"Please Enter A vallid Email");
    }

    if(!validator.isLength(password,{min:8,max:15})){
      return responseSend(resp,500,false,"Password Should be minimun 8 characters and maximun 15")
    }

    password=await bcrypt.hash(password,10);

    const user=await User.create({email,password,name,phone,city,registerAs})

    //Creating a json Web Token

    const token=jsonwebtoken.sign({id:user._id},process.env.JWT_SECRET)

  
    responseSend(resp,201,true,{token,user});
    
  } catch (error) {
    responseSend(resp, 500, false, error);
  }
};

//}


//Login User {


exports.loginUser=async(req,resp)=>{
  try {

   

    if(!req.body.email || !req.body.password){
      return responseSend(resp,500,false,"Please Enter All Fields");
    }

    if(!validator.isEmail(req.body.email)){
      return  responseSend(resp,500,false,"Please Enter A vallid Email");
     }

    

    const user=await User.findOne({email:req.body.email}).select("+password").clone();
    

    if(!user){
     return responseSend(resp,500,false,"Email And Password are Incorrect");
    }


    const hashPass=await bcrypt.compare(req.body.password,user.password);

    

    const token=jsonwebtoken.sign({id:user._id},process.env.JWT_SECRET);


    if(hashPass){
     return resp.status(201).json({
        user,
        token,
        code:201
      })
    }

    responseSend(resp,200,false,"Email And Password Are Incorrect");

    
  } catch (error) {
    responseSend(resp, 500, false, error);
  }
}


//}



//controller to add the property to the favourite list


exports.addFavourite=async(req,resp)=>{
  try {

    let {property_id}=req.params;

    let user=await User.findById(req.user._id).clone();
    

    let check=user.favourites.filter((elm)=>{
      return elm===property_id;
    })

    if(check.length>0){
      return responseSend(resp,500,false,'Property already added to favourite list');
    }

    user.favourites.push(property_id.toString());

    await user.save({validateBeforeSave:false});

    responseSend(resp,200,true,'Property added to favourite list');

           

  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}


//Controller to get the favourites properties of the user

exports.getFavourites=async(req,resp)=>{

  try {
    
  
   let user=await User.findById(req.user._id);

   var fav=[];

   for(var i=0;i<user.favourites.length;i++){
    
     let prop=await Property.findById(user.favourites[i]).clone()
     fav.push(prop);
     
   }

   responseSend(resp,200,true,fav)

  } catch (error) {

    responseSend(resp,500,false,error.message);
    
  }
}


//Controller to delete the favourites properties of the user


exports.delFavourite=async(req,resp)=>{
  try {
    
    let {property_id}=req.params;

    let user=await User.findById(req.user._id).clone();

    user.favourites= user.favourites.filter((elm)=>{
      return elm!=property_id
    })

    await user.save({validateBeforeSave:false});

    responseSend(resp,200,true,'Successfully Deleted');


  } catch (error) {
    
    responseSend(resp,500,false,error.message);

  }
}

//admin to get single user


exports.adminGetSingleUser=async(req,resp)=>{

  try {

    let user=await User.findById(req.params.id);

    responseSend(resp,200,true,user.role);
    
  } catch (error) {

    responseSend(resp,500,false,error.message);

  }
}

//For admin to get all the users

exports.adminGetUsers=async(req,resp)=>{

  try {
    
    let users=await User.find()
    responseSend(resp,200,true,users);

  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}





//For admin to edit the role of the user

exports.adminEdit=async(req,resp)=>{

  try{

    await User.findByIdAndUpdate(req.params.id,{role:req.params.role});
    responseSend(resp,200,true,'Edit Successfully');

  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}


//For admin to delete the user


exports.adminDelete=async(req,resp)=>{

  try {
      
    await User.findByIdAndDelete(req.params.id);

    responseSend(resp,201,true,"Deleted Successfully");

  } catch (error) {

    responseSend(resp,500,false,error.message);

  }
}

// To add the property to user recents when user view click or call the property

exports.recent=async(req,resp)=>{

  try {
    let user=await User.findById(req.user._id);

    let check=user.recent.filter((elm)=> elm.toString()===req.params.propertyId);

    if(check.length>0){
      return resp.status(422).json({success:false,message:'Only in recents of user'});
    }

    if(user.recent.length==5){

      let randomNumber=Math.floor(Math.random()*5);
      user.recent[randomNumber]=req.params.propertyId;
      await user.save();
      return  resp.status(201).json({success:true,message:"Added in recents of user"});

    }

    user.recent.push(req.params.propertyId);

    await user.save();

    resp.status(201).json({success:true,message:"Added in recents of user"});
    
  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}

//To get the user recent interacted Properties

exports.getRecent=async(req,resp)=>{

  try {
    
   let recentProperties=[];

   for(let i=0;i<req.user.recent.length;i++){

    let property= await Property.findById(req.user.recent[i]);
    recentProperties.push(property);

   }

   resp.status(200).json({success:true,message:recentProperties});

  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}

//For logged in user to delete his notifications


exports.deleteNotification=async(req,resp)=>{
  try {
    
    let result=await User.findByIdAndUpdate(req.params._id,{$pull:{notifications:{_id:ObjectID(req.params.notificationId)}}})
    console.log(result);
    resp.status(201).json({success:true,message:"Notification Deleted"});

    
  } catch (error) {
    console.log(error)
    responseSend(resp,500,false,error.message);
  }
}