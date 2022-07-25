//importing some usefull moduels{
const mongoose = require("mongoose");
const Property = require("../models/propertyModel");
const responseSend = require("../utils/response");
const validator=require("validator");
const User=require("../models/userModel");
//}

//creating main functions that will be called when the specific route will hit{


//Controllers for admin routes{

//For admin to delete Property

exports.adminDelete=async(req,resp)=>{

  try {

    await Property.findByIdAndDelete(req.params.id);
    
    responseSend(resp,201,true,"Deleted Successfully");

  } catch (error) {
    
    responseSend(resp,500,false,"Something Went Wrong");

  }
}

//For admin to edit property


exports.adminEdit=async(req,resp)=>{
  try {
    await Property.findByIdAndUpdate(req.params.id,req.body);

    responseSend(resp,201,true,"Updated");
    

  } catch (error) {

    responseSend(resp,500,false,"Something Went Wrong");

  }
}


//For admin to get singe property with id

exports.adminGetSingle=async(req,resp)=>{

  try {

    let property=await Property.findById(req.params.id);
    responseSend(resp,201,true,property);

  } catch (error) {

    responseSend(resp,500,false,error.message);
  }
}


//To get properties for admin
exports.adminGetProperty=async(req,resp)=>{
  try {

      const property = await Property.find().clone();

      responseSend(resp,200,true,property);

  } catch (error) {
    
    
    responseSend(resp,500,false,"Something Went Wrong");

  }
}


//}


//Controller to find the nearest property of given longitude and latitude in a range of 2kms


exports.getPropertyCoordinate=async(req,resp)=>{
  try {
    
    const longitude=req.body.longitude;
    const latitude=req.body.latitude;

    const property=await Property.find({
      location:{
        $near:{
          $geometry:{
            type:"Point",
            coordinates:[parseFloat(longitude),parseFloat(latitude)]
          },

          $maxDistance:2000
        }
      }
    })

    responseSend(resp,200,true,property);
   

  } catch (error) {
    responseSend(resp,500,false,error);

  }
}



//Controller to get the property details{
exports.getProperty = async (req, resp) => {
  try {
   
    const property = await Property.find({status:'active'})
      .sort({ superHot: -1, verified: -1 })
      .clone();
    responseSend(resp, 200, true, property);
  } catch (error) {
    responseSend(resp, 500, false, error);
  }
};
//}

//Controller to add the property to database{

exports.addProperty = async (req, resp) => {
  try {

     let location=req.body.location;
     delete req.body["location"];

     req.body.purpose=req.body.purpose.toLowerCase();
     req.body.propertyType=req.body.propertyType.toLowerCase();
     req.body.propertySubType=req.body.propertySubType.toLowerCase();
     req.body.city=req.body.city.toLowerCase();
     req.body.propertyTitle=req.body.propertyTitle.toLowerCase();
     req.body.landAreaUnit=req.body.landAreaUnit.toLowerCase();


     const newProperty = await Property.create({...req.body,user:req.user._id,location:{type:"Point",address:location.address,coordinates:[parseFloat(location.coordinates[0]),parseFloat(location.coordinates[1])]}});

    responseSend(resp, 201, true, newProperty);
  } catch (error) {
    
    responseSend(resp, 500, false, error);
  }
};

//}

//conroller to filter the property by different queries{

exports.filterProperty = async (req, resp) => {
  try {
    
    const property = await Property.find({
      $and: [
        req.query.gt!=="undefined" ? { price: { $gte: req.query.gt } } : {},
        req.query.lt!=="undefined" ? { price: { $lte: req.query.lt } } : {},
        req.query.city!=="undefined" ? { city: req.query.city } : {},
        req.query.propertySubType!=="undefined"
          ? { propertySubType: req.query.propertySubType }
          : {},

        req.query.propertyType!=="undefined" ? { propertyType: req.query.propertyType } : {},
        req.query.purpose!=="undefined" ? { purpose: req.query.purpose } : {},
        req.query.latitude!=="undefined" && req.query.longitude!=="undefined"
          ? {
            location:{
              $near:{
                $geometry:{
                  type:"Point",
                  coordinates:[parseFloat(req.query.longitude),parseFloat(req.query.latitude)]
                },
      
                $maxDistance:parseInt(req.query.radius)
              }
            }
          }
          : {},
        req.query.landAreaNumbergt!=="undefined"
          ? { landAreaNumber: { $gte: req.query.landAreaNumbergt } }
          : {},
        req.query.landAreaNumberlt!=="undefined"
          ? { landAreaNumber: { $lte: req.query.landAreaNumberlt } }
          : {},
        req.query.landAreaUnit!=="undefined" ? { landAreaUnit: req.query.landAreaUnit } : {},
        req.query.bedroom!=="undefined"
          ? req.query.bedroom === "10"
            ? { bedroom: { $gte: 10 } }
            : { bedroom: req.query.bedroom }
          : {},
        req.query.bathroom!=="undefined"
          ? req.query.bathroom === "10"
            ? { bathroom: { $gte: 10 } }
            : { bathroom: req.query.bathroom }
          : {},
          {status:'active'}
      ],
    })
      .sort({ superHot: -1, verified: -1 })
      .clone();

    responseSend(resp, 200, true, property);
  } catch (error) {
    responseSend(resp, 500, false, error);
  }
};

//}


// Delete the property {

exports.deleteProperty=async(req,resp)=>{

  try {

  const checkProperty=await Property.deleteOne({user:req.user._id,_id:req.params.property_id}).clone();
  

  if(checkProperty.deletedCount===0){
   return responseSend(resp,500,false,"Cannot Delete this property");
  }

  responseSend(resp,200,true,"Property Deleted");

  } catch (error) {
    
    responseSend(resp,500,false,"Something Went Wrong");

  }

}
//}

// Update the property{

exports.updateProperty=async(req,resp)=>{

  try {
    
    const property=await Property.updateOne({_id:req.params.property_id,user:req.user._id},req.body).clone();

    

    if(property.matchedCount==0){
      return responseSend(resp,500,false,"Property Cannot be updated")
    }

    responseSend(resp,200,true,'Property Updated');


  } catch (error) {
  
    responseSend(resp,500,false,"Something Went Wrong")
    
  }
}


//}


//Get all properties of logged in user= {


exports.loggedInUserProperties=async(req,resp)=>{

  try {

    const property=await Property.find({user:req.user._id}).clone()

    if(property.length>0){
      return responseSend(resp,200,true,property);
    }

    responseSend(resp,404,false,"No property Found");
    
  } catch (error) {

    responseSend(resp,500,false,'Something Went Wrong');

  }
}

//get single property with id

exports.singleProperty=async(req,resp)=>{

  try {
    
    let property=await Property.findById(req.params.property_id).clone()

    let user=await User.findById(property.user).clone();
    
    let userDetails={
      name:user.name,
      phone:user.phone,
      email:user.email,
      city:user.city
    }

    let final={property,userDetails};

    if(property){
      return responseSend(resp,200,true,final);
    }

    responseSend(resp,500,false,'No property Found');

  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}


//controller to increase the views of the property


exports.increaseView=async(req,resp)=>{

  try {
    
    let {property_id}=req.params;
    
    let property=await Property.findById(property_id).clone();

    let check=property.views.filter((elm)=>{
      return elm===(req.user._id).toString();
    })

    if(check.length>0){
      return responseSend(resp,500,false,'Already Viewed');
    }

    property.views.push((req.user._id).toString());

    await property.save({validateBeforeSave:false});

    responseSend(resp,200,true,'viewed');

  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}

//To get the views of single Property

exports.getView=async(req,resp)=>{
  try {

    let {property_id}=req.params;

    let property=await Property.findById(property_id).clone();

    responseSend(resp,200,true,property.views.length);

    
  } catch (error) {

    responseSend(resp,500,false,error.message);
    
  }
}


//To increase the clicks

exports.increaseClick=async(req,resp)=>{

  try {
    
    let {property_id}=req.params;
    
    let property=await Property.findById(property_id).clone();

    let check=property.clicks.filter((elm)=>{
      return elm===(req.user._id).toString();
    })

    if(check.length>0){
      return responseSend(resp,500,false,'Already Clicked');
    }

    property.clicks.push((req.user._id).toString());

    await property.save({validateBeforeSave:false});

    responseSend(resp,200,true,'Clicked');

  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}

//to get the all clicks of the user

exports.getClick=async(req,resp)=>{

  try {

    let {property_id}=req.params;

    let property=await Property.findById(property_id).clone();

    responseSend(resp,200,true,property.clicks.length);

    
  } catch (error) {

    responseSend(resp,500,false,error.message);
    
  }

}

//To increase the call button taps

exports.increaseCall=async(req,resp)=>{

  try {
    
    let {property_id}=req.params;
    
    let property=await Property.findById(property_id).clone();

    let check=property.calls.filter((elm)=>{
      return elm===(req.user._id).toString();
    })

    if(check.length>0){
      return responseSend(resp,500,false,'Already Called');
    }

    property.calls.push((req.user._id).toString());

    await property.save({validateBeforeSave:false});

    responseSend(resp,200,true,'Called');

  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}

//To get how many call buttons havebeen clicked of single property


exports.getCall=async(req,resp)=>{

  try {

    let {property_id}=req.params;

    let property=await Property.findById(property_id).clone();

    responseSend(resp,200,true,property.calls.length);

    
  } catch (error) {

    responseSend(resp,500,false,error.message);
    
  }

}


//to get the properties of logged in user and will be filtered by active rejected or pending

exports.loggedInUserStatusProperties=async(req,resp)=>{

  try {
    
  let {status}=req.params;

  let property=await Property.find({status:status,user:req.user._id});

  responseSend(resp,200,true,property);

  } catch (error) {
    
    responseSend(resp,500,false,error.message);

  }
}


//To get the recently added properties 

exports.recentlyAdded=async(req,resp)=>{

  try {

    let properties=await Property.find().sort({added:-1}).limit(3);
     
    responseSend(resp,200,true,properties);
    
  } catch (error) {

    responseSend(resp,500,false,error.message);

  }
}

//}