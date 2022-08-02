const router=require("express").Router();
const { getMessages, addMessage, getSingle } = require("../controllers/chatController");
const verifyToken = require("../middlewares/verifyToken");

router.route('/get-messages').post(verifyToken,getMessages);
router.route("/add-messages").post(verifyToken,addMessage);
router.route("/all-users").get(verifyToken,getSingle);


module.exports=router;