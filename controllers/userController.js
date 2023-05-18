const User = require("../models/userModel");
const responseSend = require("../utils/response");
const bcrypt=require("bcrypt");
const validator=require("validator");
const jsonwebtoken=require("jsonwebtoken");
const Property=require("../models/propertyModel");


// To register the user{

exports.RegisterUser = async (req, resp) => {
  
try {

    let {password,email,name,phone}=req.body;
  
    const checkEmail=await User.findOne({email});
    const checkPhone=await User.findOne({phone});

    if(checkEmail){
      return responseSend(resp,500,false,'Email Already Exist')
    }

    if(checkPhone){
      return responseSend(resp,500,false,'Phone Number Already Exist')
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

    const user=await User.create({email,password,name,phone})

    //Creating a json Web Token

    const token=jsonwebtoken.sign({id:user._id},process.env.JWT_SECRET)
    
    delete user.password
  
    resp.status(201).json({success:true,message:{token,user}})
    
  } catch (error) {
    resp.status(500).json({success:true,message:error.message})
  }
};

//}


//Login User {


exports.loginUser=async(req,resp)=>{
  try {

    if(req.query.isGoogle){
        let user = await User.findOne({email:req.body.email});
        if(!user){
           user = await User.create({email:req.body.email,name:req.body.name});
        }
        const token=jsonwebtoken.sign({id:user._id},process.env.JWT_SECRET);
        resp.status(201).json({
          success:true,
          message:{
            user,
            token
          }
        })
    }else{

      if(!req.body.email || !req.body.password){
      return responseSend(resp,500,false,"Please Enter All Fields");
    }

     const user = await User.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.email }],
    }).select("+password").clone();

    if(!user){
     return responseSend(resp,500,false,"Incorrect login credentials");
    }

    const hashPass=await bcrypt.compare(req.body.password,user.password);

    const token=jsonwebtoken.sign({id:user._id},process.env.JWT_SECRET);


    if(hashPass){
     return resp.status(201).json({success:true,message:{user,token}});
    }

    resp.status(500).json({success:false,message:"Incorrect login credentials"});
  }
    
  } catch (error) {
    resp.status(500).json({success:false,message:error.message});
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
      await user.save({validateBeforeSave:false});
      return  resp.status(201).json({success:true,message:"Added in recents of user"});

    }

    user.recent.push(req.params.propertyId);

    await user.save({validateBeforeSave:false});

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
    
    await User.updateOne({_id:req.user._id},{$pull:{notifications:{_id:req.params.notificationId}}})
    
    resp.status(201).json({success:true,message:"Notification Deleted"});

  } catch (error) {

    responseSend(resp,500,false,error.message);
  }
}

//To get the fcm token from front-end

exports.getFCMToken=async(req,resp)=>{

  try {
    
    let user=await User.findById(req.user._id);

    user.token=req.body.token;

    user.save({validateBeforeSave:false});

    responseSend(resp,201,true,'Token Saved')

  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}

//To get nofifications for admin

exports.adminNotification=async(req,resp)=>{

  try{

    responseSend(resp,200,true,req.user.notifications.reverse())

  } catch(error) {
    responseSend(resp,500,false,error.message);
  }
}

//To update user settings

exports.updateSetting=async(req,resp)=>{

  try {
    
    let {notification,featuredAd,viewAd}=req.body;

    await User.findByIdAndUpdate(req.user._id,
      {$set:
        {'setting.notification':notification,'setting.featuredAd':featuredAd,'setting.viewAd':viewAd}
      })

    resp.status(201).json({success:true,message:"Updated"})

  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}


//To get The settings of login user

exports.getSetting=async(req,resp)=>{

  try {
    
    let user=await User.findById(req.user._id);

    responseSend(resp,200,true,user.setting);

  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}

//To update the seen of the notifications of admn or users

exports.updateNotification=async(req,resp)=>{

  try {
  
  let user=await User.findById(req.user._id);

  for(let i=0;i<user.notifications.length;i++){

    user.notifications[i].seen=true;

  }

  await user.save({validateBeforeSave:false});

  responseSend(resp,201,true,'Updated');

  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}

//To get any unseen notification for user

exports.getUnseenNotification=async(req,resp)=>{

  try {

    let notification=await User.find({_id:req.user._id,'notifications.seen':false});

    if(notification.length>0){

      return responseSend(resp,200,true,false);

    }

    responseSend(resp,200,true,true);
     
  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}


//To update the user password

exports.updatePassword=async(req,resp)=>{
  try {
    
    let {password,oldPassword}=req.body;

    let user=await User.findById(req.user._id).select("+password");
   
    let check=await bcrypt.compare(oldPassword,user.password);

    if(!check){
      return responseSend(resp,500,false,"Password Do Not Match");
    }

    if(!validator.isLength(password,{min:8,max:15})){
      return responseSend(resp,500,false,"Password Should be minimun 8 characters and maximun 15")
    }

    let hashPassword=await bcrypt.hash(password,10);

    await User.findByIdAndUpdate(req.user._id,{password:hashPassword});

    responseSend(resp,201,true,'Password Updated');
  
  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}

//TO UPDATE THE USER EMAIL  

exports.updateEmail=async(req,resp)=>{

  try {
  
    let {email}=req.body;

    const checkEmail=await User.findOne({email});

    if(checkEmail){
      return responseSend(resp,500,false,"Email Already exists");
    }

    if(!validator.isEmail(email)){
      return  responseSend(resp,500,false,"Please Enter A vallid Email");
     }

     await User.findByIdAndUpdate(req.user._id,{email});

     responseSend(resp,201,true,'Email Updated');


  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}

//To update the phone Number

exports.updatePhone=async(req,resp)=>{
  try {

    let {phone}=req.body;

    const checkPhone=await User.findOne({phone});

    if(checkPhone){
      return responseSend(resp,500,false,'Phone Number Already Exist')
    }

    await User.findByIdAndUpdate(req.user._id,{phone});

    responseSend(resp,201,true,"Phone Number Updated");
    
  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}

//To get the logged in user details

exports.loggedUserDetails=async(req,resp)=>{

  try {

    responseSend(resp,200,true,req.user);
    
  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}


//For admin to get all users properties || properties for rent and for sale

exports.adminDetails=async(req,resp)=>{

  try {
    
    let allUser=await User.find();
    let allProperties=await Property.find();
    let propertiesRent=await Property.find({purpose:'rent'});
    let properteisSale=await Property.find({purpose:"sale"});

    responseSend(resp,200,true,{allUser,allProperties,propertiesRent,properteisSale})

  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}