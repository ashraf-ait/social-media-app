const {Comment } = require("../models/Comment");
const { User } = require("../models/User");


/**-----------------------------------------------
 * @desc    Create New Comment
 * @route   /api/comments
 * @method  POST
 * @access  private (only user login
 ------------------------------------------------*/
 module.exports.createCommentCtrl = async (req, res) => {
  
    const profile = await User.findById(req.user.id);

    const comment = await Comment.create({
        postId: req.body.postId,
        text: req.body.text,
        user: req.user.id,
        username: profile.username,
      });
  
    res.status(201).json(comment);
  };
  



  /**-----------------------------------------------
 * @desc    Get All Comments
 * @route   /api/comments
 * @method  GET
 * @access  private only admin
 ------------------------------------------------*/
module.exports.getAllCommentsCtrl = async (req, res) => {
    const comments = await Comment.find().populate("user");
    res.status(200).json(comments);
  };
  



/**-----------------------------------------------
 * @desc    Delete Comment
 * @route   /api/comments/:id
 * @method  DELETE
 * @access  private (only admin or user commnter)
 ------------------------------------------------*/
 module.exports.deleteCommentCtrl = async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "comment not found" });
    }
  
    if (req.user.isAdmin || req.user.id === comment.user.toString()) {
      await Comment.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "comment has been deleted" });
    } else {
      res.status(403).json({ message: "access denied, not allowed" });
    }
  };


  /**-----------------------------------------------
 * @desc    Update Comment
 * @route   /api/comments/:id
 * @method  PUT
 * @access  private only user create
 ------------------------------------------------*/
 module.exports.updateCommentCtrl = async (req, res) => {
 

  const comment = await Comment.findById(req.params.id);
  if(!comment) {
    return res.status(404).json({ message: "comment not found" });
  }
  
  if(req.user.id !== comment.user.toString()) {
    return res.status(403).json({ message: "access denied, only user himself can edit his comment" });
  }

  const updatedComment = await Comment.findByIdAndUpdate(req.params.id, {
    $set: {
      text: req.body.text,
    }
  }, { new : true });
  
  res.status(200).json(updatedComment);
};
