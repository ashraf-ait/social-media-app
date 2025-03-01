const {User} = require("../models/User")
const bcrypt = require("bcryptjs")
const path = require("path")
const fs = require("fs") //file systeme
const {cloudinaryUploadImage, cloudinaryRemoveImage,cloudinaryRemoveMultipleImage } = require("../utils/cloudinary");
const { Comment } = require("../models/Comment");
const { Post } = require("../models/Post");








// Get All Users Profile
// route   /api/users/profile
// method  GET
// access  private (admin)

module.exports.getAllUsersCtrl = async (req, res) => {
    const users = await User.find().select("-password").populate("posts"); 
    res.status(200).json(users)

}



// Get User Profile
// route   /api/users/profile/:id
// method  GET
// access  public

module.exports.getUserProfileCtrl = async (req, res) => {
    
    const user = await User.findById(req.params.id).select("-password").populate("posts");
    if(!user){
       return res.status(400).json({message: "user not found"})

    }else{
        res.status(200).json(user);
    }

}


// Update User Profile
// route   /api/users/profile/:id
// method  PUT
// access  private (user)
module.exports.updateUserProfileCtrl = async (req,res)=>{
     try{
        if(req.body.password){
        req.body.password  = await bcrypt.hash(req.body.password,10)
     }
     const updateUser = await User.findByIdAndUpdate(req.params.id,{
        $set:{
            username: req.body.username,
            password: req.body.password,
            bio: req.body.bio
        }
     },{new: true})
     .select("-password")
     .populate("posts");
     res.status(200).json(updateUser)

     }catch(err){
        res.status(500).json({message : err.message })
     }

}



// Get Users Count
// route   /api/users/count
// method  GET
// access  private (admin)

module.exports.getUsersCountCtrl = async (req, res) => {
    const count = await User.countDocuments();
    res.status(200).json(count)

}

    



// Profile Photo Upload
// route   /api/users/profile-photo-upload
// method  post
// access  private (only login User)
module.exports.profilPhotoUploadCtrl = async (req, res) => {
    // 1. Validation
  if (!req.file) {
    return res.status(400).json({ message: "no file provided" });
  }
     // 2. Get the path to the image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    // 3. Upload to cloudinary
    const result = await cloudinaryUploadImage(imagePath);

      // 4. Get the user from DB
     const user = await User.findById(req.user.id);
    // 5. Delete the old profile photo if exist on cloud
    if (user.profilePhoto.publicId !== null) {
        await cloudinaryRemoveImage(user.profilePhoto.publicId);
      }
    
      // 6. Change the profilePhoto field in the DB
    user.profilePhoto = {
        url: result.secure_url,
        publicId: result.public_id,
    };
    await user.save();

   // 7. Send response to client
   res.status(200).json({
    message: "your profile photo uploaded successfully",
    profilePhoto: { url: result.secure_url, publicId: result.public_id },
  });

  // 8. Remvoe image from the server
  fs.unlinkSync(imagePath); //file systeme delet file

}




// delet user profil account
// route   /api/users/profile/:id
// method  DELETE
// access  private (only admin or user login )

 module.exports.deleteUserProfileCtrl = async (req, res) => {
  // 1. Get the user from DB
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  // 2. Get all posts from DB
  const posts = await Post.find({ user: user._id });
  // 3. Get the public ids from the posts
  const publicIds = posts?.map((post) => post.image.publicId);
  // 4. Delete all posts image from cloudinary that belong to this user
  if(publicIds?.length > 0) {
    await cloudinaryRemoveMultipleImage(publicIds);
  }

  // 5. Delete the profile picture from cloudinary
  if(user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }
  
  // 6. Delete user posts & comments
  await Post.deleteMany({ user: user._id });
  await Comment.deleteMany({ user: user._id });

  // 7. Delete the user himself
  await User.findByIdAndDelete(req.params.id);

  // 8. Send a response to the client
  res.status(200).json({ message: "your profile has been deleted" });
};