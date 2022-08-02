const router=require("express").Router();
const { getMessages, addMessage } = require("../controllers/chatController");
const verifyToken = require("../middlewares/verifyToken");

router.route('/get-messages').post(verifyToken,getMessages);
router.route("/add-messages").post(verifyToken,addMessage);


module.exports=router;