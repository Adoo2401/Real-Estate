const express = require("express");
const { RegisterUser, loginUser,addFavourite, getFavourites, delFavourite, adminGetUsers, adminEdit, adminDelete, adminGetSingleUser, recent, getRecent, deleteNotification, getFCMToken, adminNotification, updateSetting, getSetting, updateNotification, getUnseenNotification, updatePassword, updateEmail, updatePhone } = require("../controllers/userController");
const verifyRole = require("../middlewares/verifyRole");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

// All the user related routes herer{

router.route("/register").post(RegisterUser);
router.route("/login").post(loginUser);
router.route("/add_fav/:property_id").post(verifyToken,addFavourite);
router.route("/get_fav").get(verifyToken,getFavourites);
router.route('/del_fav/:property_id').delete(verifyToken,delFavourite);
router.route("/recents/:propertyId").post(verifyToken,recent);
router.route("/getRecent").get(verifyToken,getRecent);
router.route("/deleteNotification/:notificationId").delete(verifyToken,deleteNotification)
router.route("/getToken").post(verifyToken,getFCMToken)
router.route('/update-setting').put(verifyToken,updateSetting);
router.route("/get-setting").get(verifyToken,getSetting);
router.route("/update-password").put(verifyToken,updatePassword);
router.route("/update-email").put(verifyToken,updateEmail);
router.route("/update-phone").put(verifyToken,updatePhone);

//admin routes

router.route("/admin-users").get(verifyToken,verifyRole,adminGetUsers);
router.route("/admin-edit-users/:id/:role").put(verifyToken,verifyRole,adminEdit);
router.route("/admin-delete-users/:id").delete(verifyToken,verifyRole,adminDelete)
router.route('/admin-single-user/:id').get(verifyToken,verifyRole,adminGetSingleUser);
router.route("/admin-notification").get(verifyToken,verifyRole,adminNotification)
router.route('/admin-update-notification').put(verifyToken,verifyRole,updateNotification)
router.route("/admin-getUnseenNotification").get(verifyToken,verifyRole,getUnseenNotification);
//}

module.exports = router;
