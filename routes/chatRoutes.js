const router=require("express").Router();
const { getMessages, addMessage, getSingle, deleteMessage } = require("../controllers/chatController");
const verifyToken = require("../middlewares/verifyToken");

router.route('/get-messages').post(verifyToken,getMessages);
router.route("/add-messages").post(verifyToken,addMessage);
router.route("/all-users").get(verifyToken,getSingle);
router.route("/delete-message/:userId").delete(verifyToken,deleteMessage);


module.exports=router;