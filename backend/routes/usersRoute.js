const router= require("express").Router();
const {getAllUsersCtrl, getUserProfileCtrl, updateUserProfileCtrl,getUsersCountCtrl, profilPhotoUploadCtrl,deleteUserProfileCtrl} = require("../controllers/usersController");
const { verifyTokenAndAdmin, verifyTokenAndOnlyUser,verifyToken,verifyTokenAndAuthorization } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");
const photoUpload = require("../middlewares/photoUpload")


// /api/users/profile
router.route("/profile").get(verifyTokenAndAdmin,getAllUsersCtrl);

// /api/users/profile/:id
router.route("/profile/:id")
      .get(validateObjectId,getUserProfileCtrl)
      .put(validateObjectId,verifyTokenAndOnlyUser, updateUserProfileCtrl)
      .delete(validateObjectId,verifyTokenAndAuthorization,deleteUserProfileCtrl)

// /api/users/profile/profile-photo-upload
router.route("/profile/profile-photo-upload")
      .post(verifyToken,photoUpload.single("image"),profilPhotoUploadCtrl);

// /api/users/count
router.route("/count").get(verifyTokenAndAdmin,getUsersCountCtrl);





module.exports=router;