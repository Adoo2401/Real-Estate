//importing some usefull moduels{
const Property = require("../models/propertyModel");
const responseSend = require("../utils/response");
const User=require("../models/userModel");
const cloudinary=require("cloudinary");
const path=require("path");
const pushNotification = require("../utils/pushNotification");
const sendToAdmin = require("../utils/sendToAdmin");
const formatBufferTo64 = require("../utils/formatBuffer");
//}

//creating main functions that will be called when the specific route will hit{


//Controllers for admin routes{

//For admin to delete Property

exports.adminDelete=async(req,resp)=>{

  try {

    let property=await Property.findById(req.params.id);
    let user=await User.findById(property.user);
       
    await Property.findByIdAndDelete(req.params.id);

    if(user.token && user.setting.notification===true){
      pushNotification(user.token,`Your Property '${property.propertyTitle}' has been Deleted By Admin`)
    }

    responseSend(resp,201,true,"Deleted Successfully");

  } catch (error) {
    
    responseSend(resp,500,false,"Something Went Wrong");

  }
}

//For admin to edit property


exports.adminEdit=async(req,resp)=>{
  try {

    let property=await Property.findByIdAndUpdate(req.params.id,req.body);
    let user=await User.findById(property.user)

    if(user.token && user.setting.notification===true){
      pushNotification(user.token,`Your property ${property.propertyTitle} has been changed to ${req.body.status}`); 
    }

    responseSend(resp,200,true,'Updated');

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
    let picturesInfo=[];

    for(let i = 0; i<req.files.length; i++){
      const file = formatBufferTo64(req.files[i]);
      let pictures = await cloudinary.v2.uploader.upload(file.content,{folder:"Property Images"})
      picturesInfo.push({public_id:pictures.public_id,url:pictures.url});
    }
    
     let address=req.body.address || "Some Adress";
     let longitude=req.body.longitude;
     let latitude=req.body.latitude;
     let city = req.body.city || "Lahore"

     delete req.body.longitude;
     delete req.body.latitude;
     delete req.body.address

     req.body.images=picturesInfo;

     const newProperty = await Property.create({...req.body,user:req.user._id,city,location:{type:"Point",address:address,coordinates:[parseFloat(longitude),parseFloat(latitude)]}});

     await sendToAdmin(`A new property has been added ${newProperty.propertyTitle}`,newProperty._id);

     responseSend(resp, 201, true, newProperty);
  } catch (error) {
    responseSend(resp, 500, false, error.message);
  }
};

//}

//conroller to filter the property by different queries{

exports.filterProperty = async (req, resp) => {
  try {
    
  
    let gt=req.query.gt==='undefined'?undefined:req.query.gt;
    let purpose = req.query.purpose==="undefined"?undefined:req.query.purpose;
    let lt=req.query.lt==='undefined'?undefined:req.query.lt;
    let city=req.query.city==='undefined'?undefined:req.query.city;
    let propertySubType=req.query.propertySubType==='undefined'?undefined:req.query.propertySubType;
    let propertyType=req.query.propertyType==='undefined'?undefined:req.query.propertyType
    let landAreaNumbergt=req.query.landAreaNumbergt==='undefined'?undefined:req.query.landAreaNumbergt;
    let landAreaNumberlt=req.query.landAreaNumberlt==='undefined'?undefined:req.query.landAreaNumberlt;
    let landAreaUnit=req.query.landAreaUnit==='undefined'?undefined:req.query.landAreaUnit;
    let bedroom=req.query.bedroom==='undefined'?undefined:req.query.bedroom;
    let bathroom=req.query.bathroom==='undefined'?undefined:req.query.bathroom

    const page = parseInt(req.query.page) || 1;
    const pageSize = 15;
    
    const property = await Property.find({
      $and: [
        gt!==undefined ? { price: { $gte: req.query.gt } } : {},
        lt!==undefined ? { price: { $lte: req.query.lt } } : {},
        city!==undefined ? { city: req.query.city } : {},
        propertySubType!==undefined
          ? { propertySubType: req.query.propertySubType }
          : {},

        propertyType!==undefined ? { propertyType: req.query.propertyType } : {},
        purpose!==undefined ? { purpose: req.query.purpose } : {},
        req.query.latitude!==undefined && req.query.longitude!==undefined
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
          landAreaNumbergt!==undefined
          ? { landAreaNumber: { $gte: req.query.landAreaNumbergt } }
          : {},
        landAreaNumberlt!==undefined
          ? { landAreaNumber: { $lte: req.query.landAreaNumberlt } }:{},
        landAreaUnit!==undefined ? { landAreaUnit: req.query.landAreaUnit } : {},
        bedroom!==undefined
          ? req.query.bedroom === "10"
            ? { bedroom: { $gte: 10 } }
            : { bedroom: req.query.bedroom }
          : {},
        bathroom!==undefined
          ? req.query.bathroom === "6"
            ? { bathroom: { $gte: 6 } }
            : { bathroom: req.query.bathroom }
          : {},
          {status:'active'}
      ],
    })
      .sort({ superHot: -1, verified: -1 }).select("_id propertyTitle bedroom bathroom landAreaNumber landAreaUnit purpose price images location")

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
    
     let address=req.body.address;
     let longitude=req.body.longitude;
     let latitude=req.body.latitude;

     delete req.body.longitude;
     delete req.body.latitude;
     delete req.body.address


    const property=await Property.updateOne({_id:req.params.property_id,user:req.user._id},{...req.body,location:{type:"Point",address:address,coordinates:[parseFloat(longitude),parseFloat(latitude)]},status:'pending'}).clone();

    if(property.matchedCount==0){
      return responseSend(resp,500,false,"Property Cannot be updated")
    }

    await sendToAdmin(`A property has been Updated`,req.params.property_id)

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
    
    let property=await Property.findById(req.params.property_id).populate("user","name email phone");

    if(property){
      return responseSend(resp,200,true,property);
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

  let query = { user: req.user._id };

   if (status !== 'All Ads') {
     query.status = status;
   }

   let property = await Property.find(query);

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

// For admin to get all the properties added in a single year

exports.getYearProperty=async(req,resp)=>{

  try {

    let currentYear=new Date().getFullYear();
    let fourthYear=currentYear -1;
    let thirdYear=fourthYear -1;
    let secondYear=thirdYear-1;
    let firstYear=secondYear-1;

    let propertyAdded=[];
    let propertySold=[];
    let propertyRent=[];
  

    let property1=await Property.find({added:{$gte:new Date(`${currentYear}-01-1`),$lte:new Date(`${currentYear}-12-31`)}});
    let property2=await Property.find({added:{$gte:new Date(`${fourthYear}-01-1`),$lte:new Date(`${fourthYear}-12-31`)}});
    let property3=await Property.find({added:{$gte:new Date(`${thirdYear}-01-1`),$lte:new Date(`${thirdYear}-12-31`)}});
    let property4=await Property.find({added:{$gte:new Date(`${secondYear}-01-1`),$lte:new Date(`${secondYear}-12-31`)}});
    let property5=await Property.find({added:{$gte:new Date(`${firstYear}-01-1`),$lte:new Date(`${firstYear}-12-31`)}});

    let property6=await Property.find({added:{$gte:new Date(`${currentYear}-01-1`),$lte:new Date(`${currentYear}-12-31`)},situation:"sold"});
    let property7=await Property.find({added:{$gte:new Date(`${fourthYear}-01-1`),$lte:new Date(`${fourthYear}-12-31`)},situation:"sold"});
    let property8=await Property.find({added:{$gte:new Date(`${thirdYear}-01-1`),$lte:new Date(`${thirdYear}-12-31`)},situation:"sold"});
    let property9=await Property.find({added:{$gte:new Date(`${secondYear}-01-1`),$lte:new Date(`${secondYear}-12-31`)},situation:"sold"});
    let property10=await Property.find({added:{$gte:new Date(`${firstYear}-01-1`),$lte:new Date(`${firstYear}-12-31`)},situation:"sold"});

    let property11=await Property.find({added:{$gte:new Date(`${currentYear}-01-1`),$lte:new Date(`${currentYear}-12-31`)},situation:"rent"});
    let property12=await Property.find({added:{$gte:new Date(`${fourthYear}-01-1`),$lte:new Date(`${fourthYear}-12-31`)},situation:"rent"});
    let property13=await Property.find({added:{$gte:new Date(`${thirdYear}-01-1`),$lte:new Date(`${thirdYear}-12-31`)},situation:"rent"});
    let property14=await Property.find({added:{$gte:new Date(`${secondYear}-01-1`),$lte:new Date(`${secondYear}-12-31`)},situation:"rent"});
    let property15=await Property.find({added:{$gte:new Date(`${firstYear}-01-1`),$lte:new Date(`${firstYear}-12-31`)},situation:"rent"});

   
    propertyAdded.push({x:new Date(currentYear,0,1),y:property1.length},{x:new Date(fourthYear,0,1),y:property2.length},{x:new Date(thirdYear,0,1),y:property3.length},{x:new Date(secondYear,0,1),y:property4.length},{x:new Date(firstYear,0,1),y:property5.length});
    propertySold.push({x:new Date(currentYear,0,1),y:property6.length},{x:new Date(fourthYear,0,1),y:property7.length},{x:new Date(thirdYear,0,1),y:property8.length},{x:new Date(secondYear,0,1),y:property9.length},{x:new Date(firstYear,0,1),y:property10.length});
    propertyRent.push({x:new Date(currentYear,0,1),y:property11.length},{x:new Date(fourthYear,0,1),y:property12.length},{x:new Date(thirdYear,0,1),y:property13.length},{x:new Date(secondYear,0,1),y:property14.length},{x:new Date(firstYear,0,1),y:property15.length});
    
    responseSend(resp,200,true,[propertyAdded.reverse(),propertySold.reverse(),propertyRent.reverse()]);

  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}

exports.getCityProperties=async(req,resp)=>{

  try {
    
    let cities=['rawalpindi','islamabad','lahore','karachi','hyderabad','multan','quetta','gujranwala','sialkot','faislabad','peshawar','bahawalpur','sargodha']
    let data=[];

    for (var i = cities.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = cities[i];
      cities[i] = cities[j];
      cities[j] = temp;
    }

    for(let i=0;i<8;i++){

      let properties=await Property.find({city:cities[i]});
      data.push({city:cities[i],properties:properties.length})

    }

    responseSend(resp,200,true,data);

 
  } catch (error) {

    responseSend(resp,500,false,error.message);
  }
}

exports.adminPieChart=async(req,resp)=>{

  try {
    
    let data=[];

    let totalProperties=await Property.find();
    let totalRentProperties=await Property.find({purpose:'rent'});
    let totalSaleProperties=await Property.find({purpose:'sale'});

    data.push(
      {x:"Properties For Sale",y:totalSaleProperties.length,text:totalSaleProperties.length.toString()},
      {x:"Properties For Rent",y:totalRentProperties.length,text:totalRentProperties.length.toString()},
      {x:"Total No of Properteis",y:totalProperties.length,text:totalProperties.length.toString()}
      )

      responseSend(resp,200,true,data);

  } catch (error) {
    responseSend(resp,500,false,error.message);
  }
}