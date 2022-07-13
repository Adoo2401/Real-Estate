const express = require("express");
const {
  getProperty,
  addProperty,
  filterProperty,
  deleteProperty,
  updateProperty,
  loggedInUserProperties,
  adminGetProperty,
  adminSearch,
  adminEdit,
  adminDelete,
  getPropertyCoordinate,
  increaseView,
  getView,
  increaseClick,
  getClick,
  increaseCall,
  getCall,
  singleProperty,
  loggedInUserStatusProperties,
} = require("../controllers/propertyController");
const verifyRole = require("../middlewares/verifyRole");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

//Creating routes here for property crud operations{

router.route("/get_property").get(getProperty);
router.route("/add_property").post(verifyToken,addProperty);
router.route("/filter_property").get(verifyToken,filterProperty);
router.route("/delete_property/:property_id").delete(verifyToken,deleteProperty);
router.route("/update_property/:property_id").put(verifyToken,updateProperty);
router.route("/single/:property_id").get(verifyToken,singleProperty);
router.route("/logged_in_user_property").get(verifyToken,loggedInUserProperties)
router.route('/property_location').post(verifyToken,getPropertyCoordinate)
router.route('/view/:property_id').post(verifyToken,increaseView).get(verifyToken,getView)
router.route("/click/:property_id").post(verifyToken,increaseClick).get(verifyToken,getClick)
router.route("/call/:property_id").post(verifyToken,increaseCall).get(verifyToken,getCall);
router.route("/logged_status/:status").get(verifyToken,loggedInUserStatusProperties)


//Admin routes
router.route('/admin-property').get(verifyToken,verifyRole,adminGetProperty)
router.route("/admin-search").get(verifyToken,verifyRole,adminSearch)
router.route("/admin-edit").put(verifyToken,verifyRole,adminEdit)
router.route("/admin-delete").delete(verifyToken,verifyRole,adminDelete)


//}

module.exports = router;
