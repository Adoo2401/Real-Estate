const express = require("express");
const { RegisterUser, loginUser, logoutUser } = require("../controllers/userController");
const router = express.Router();

// All the user related routes herer{

router.route("/register").post(RegisterUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);

//}

module.exports = router;
