const express = require("express");
const { RegisterUser, loginUser,addFavourite, getFavourites, delFavourite, adminGetUsers, adminEdit, adminDelete, adminGetSingleUser } = require("../controllers/userController");
const verifyRole = require("../middlewares/verifyRole");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

// All the user related routes herer{

router.route("/register").post(RegisterUser);
router.route("/login").post(loginUser);
router.route("/add_fav/:property_id").post(verifyToken,addFavourite);
router.route("/get_fav").get(verifyToken,getFavourites);
router.route('/del_fav/:property_id').delete(verifyToken,delFavourite);


//admin routes

router.route("/admin-users").get(verifyToken,verifyRole,adminGetUsers);
router.route("/admin-edit-users/:id/:role").put(verifyToken,verifyRole,adminEdit);
router.route("/admin-delete-users/:id").delete(verifyToken,verifyRole,adminDelete)
router.route('/admin-single-user/:id').get(verifyToken,verifyRole,adminGetSingleUser);
//}

module.exports = router;
