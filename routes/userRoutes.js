const express = require("express");
const { RegisterUser, loginUser,addFavourite, getFavourites, delFavourite } = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

// All the user related routes herer{

router.route("/register").post(RegisterUser);
router.route("/login").post(loginUser);
router.route("/add_fav/:property_id").post(verifyToken,addFavourite);
router.route("/get_fav").get(verifyToken,getFavourites);
router.route('/del_fav/:property_id').delete(verifyToken,delFavourite);

//}

module.exports = router;
