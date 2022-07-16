const express = require("express");
const { RegisterUser, loginUser,addFavourite, getFavourites, delFavourite, adminGetUsers, adminSearch, adminEdit, adminDelete } = require("../controllers/userController");
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
router.route("/admin-search-users").get(verifyToken,verifyRole,adminSearch);
router.route("/admin-edit-users/:userId").put(verifyToken,verifyRole,adminEdit);
router.route("/admin-delete-users").delete(verifyToken,verifyRole,adminDelete)
//}

module.exports = router;
