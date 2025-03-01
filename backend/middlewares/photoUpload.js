const multer = require("multer");
const path = require("path");

//photo Storage
const photoStorage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, path.join(__dirname, "../images"))
    },
    filename: function(req,file,cb){
        if(file){
            cb(null, file.originalname)
        }else{
            cb(null,false)
        }
    }
})


//photo upload middleware
const photoUpload = multer({
    storage: photoStorage,
    fileFilter: function(req,file,cb){
        if(file.mimetype.startsWith("imag")){
            cb(null, true)
        }else{
            cb("file not photo",false)
        }
    },
    limits: {file: 1024*1024}
})

module.exports = photoUpload;