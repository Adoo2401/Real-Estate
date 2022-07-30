let admin=require("firebase-admin");
var serviceAccount=require("./services.json");


admin.initializeApp({
    credential:admin.credential.cert(serviceAccount)

})

module.exports.admin=admin