const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

//user schema
const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        maxlength: 20,
    },
    email:{
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
        unique: true
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength: 8,
    },
    profilePhoto: {
        type: Object,
        default:{
            url: "photo.png",
            publicId: null,
        }
    },
    bio:{
        type: String,
    },
    isAdmin:{
        type: Boolean,
        default: false,
    },
    isAccountVerified:{
        type: Boolean,
        default: false,
    },
},{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});







UserSchema.virtual("posts", { // ajouter colone post id
    ref: "Post",// knkhodoha mn post model
    foreignField: "user", //id li kyn post
    localField: "_id",//li 3ndo
});





UserSchema.methods.generateAuthToken= function() {
    return jwt.sign({id: this._id,isAdmin: this.isAdmin},process.env.JWT_SECRET);
}

//User model
const User = mongoose.model("User", UserSchema)



module.exports = {
    User,
    

}
