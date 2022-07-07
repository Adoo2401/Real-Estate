//importing some usefull moduels{
const mongoose = require("mongoose");
const Property = require("../models/propertyModel");
const responseSend = require("../utils/response");
const validator=require("validator");
//}

//creating main functions that will be called when the specific route will hit{


//Controllers for admin routes{

//For admin to delete Property


exports.adminDelete=async(req,resp)=>{

  try {

    req.body.forEach(async(elm)=>{
      await Property.findByIdAndDelete(elm._id);
    })

    responseSend(resp,201,true,"Deleted Successfully");

  } catch (error) {
    
    responseSend(resp,500,false,"Something Went Wrong");

  }
}

//For admin to edit property


exports.adminEdit=async(req,resp)=>{
  try {
    
    const _id=req.body._id;
    delete req.body["_id"];  
    
    await Property.findByIdAndUpdate(_id,req.body);

    responseSend(resp,201,true,"Updated");
    

  } catch (error) {

    responseSend(resp,500,false,"Something Went Wrong");

  }
}



//To get minimum 8 properties per page
exports.adminGetProperty=async(req,resp)=>{
  try {

    const resultPerPage = 8;
    const propertyCount = await Property.countDocuments();
    
    const currentPage = Number(req.query.page) || 1;
    let skip = resultPerPage * (currentPage - 1);

    if(req.query.skip){
     skip=Number(req.query.skip)  
    }
    
    const paginationProperty = await Property.find()
      .limit(resultPerPage)
      .skip(skip).clone();

      responseSend(resp,200,true,{paginationProperty,propertyCount})

  } catch (error) {
    
    
    responseSend(resp,500,false,"Something Went Wrong");

  }
}

//For searching in data grid search

exports.adminSearch=async(req,resp)=>{
  try {


    const resultPerPage = 8;
    const currentPage = Number(req.query.page) || 1;
    let skip = resultPerPage * (currentPage - 1);

    if(req.query.skip){
      skip=Number(req.query.skip)
    }

    if(validator.isMongoId(req.query.keyword)){
      
      const property=await Property.findById(req.query.keyword);
      return responseSend(resp,200,true,{property,id:true})

    }else{

    const property=await Property.find({
      $or: [
         
        {propertyType:req.query.keyword },
        {purpose: req.query.keyword},
        {propertySubType: req.query.keyword},
        {city:  req.query.keyword},
        {location: req.query.keyword},
        {propertyTitle: req.query.keyword},
        {landAreaUnit:  req.query.keyword}
          
      ]
    } 
   
    ).limit(resultPerPage).skip(skip).clone()

    //Searching property with same keyword but without limit and skip

    const newProperty=await Property.find({
      $or: [
         
        {propertyType:req.query.keyword },
        {purpose: req.query.keyword},
        {propertySubType: req.query.keyword},
        {city:  req.query.keyword},
        {location: req.query.keyword},
        {propertyTitle: req.query.keyword},
        {landAreaUnit:  req.query.keyword}
          
      ]
    }).clone()


    responseSend(resp,200,true,{property,count:newProperty.length})
  }

    
  
    
  } catch (error) {

    console.log(error)
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
    
    console.log(error)
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
    console.log(error)
    responseSend(resp, 500, false, error);
  }
};

//}

//conroller to filter the property by different queries{

exports.filterProperty = async (req, resp) => {
  try {
    const property = await Property.find({
      $and: [
        req.query.gt ? { price: { $gte: req.query.gt } } : {},
        req.query.lt ? { price: { $lte: req.query.lt } } : {},
        req.query.city ? { city: req.query.city } : {},
        req.query.propertySubType
          ? { propertySubType: req.query.propertySubType }
          : {},

        req.query.propertyType ? { propertyType: req.query.propertyType } : {},
        req.query.purpose ? { purpose: req.query.purpose } : {},
        req.query.keyword
          ? { location: { $regex: req.query.keyword, $options: "i" } }
          : {},
        req.query.landAreaNumbergt
          ? { landAreaNumber: { $gte: req.query.landAreaNumbergt } }
          : {},
        req.query.landAreaNumberlt
          ? { landAreaNumber: { $lte: req.query.landAreaNumberlt } }
          : {},
        req.query.landAreaUnit ? { landAreaUnit: req.query.landAreaUnit } : {},
        req.query.bedroom
          ? req.query.bedroom === "10 "
            ? { bedroom: { $gte: 10 } }
            : { bedroom: req.query.bedroom }
          : {},
        req.query.bathroom
          ? req.query.bathroom === "6 "
            ? { bathroom: { $gte: 6 } }
            : { bathroom: req.query.bathroom }
          : {},
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


//}