const fs = require("fs");
const path = require("path");
const { Post } = require("../models/Post");
const {cloudinaryUploadImage, cloudinaryRemoveImage } = require("../utils/cloudinary");
const { Comment } = require("../models/Comment");



// ceate new post
// route   /api/posts
// method  POST
// access  private (only user login )
module.exports.createPostCtrl = async (req, res) => {
    // 1. Validation for image
    if (!req.file) {
      return res.status(400).json({ message: "no image provided" });
    }
  
    // 2. Validation for data
    /*const { error } = validateCreatePost(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }*/
  
    // 3. Upload photo
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);
  
    // 4. Create new post and save it to DB
    const post = new Post({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      user: req.user.id,
      image: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
    await post.save()
  
    // 5. Send response to the client
    res.status(201).json(post);
  
    // 6. Remove image from the server
    fs.unlinkSync(imagePath);
  };



// get All post
// route   /api/posts
// method  get
// access  public
module.exports.getAllPostsCtrl = async (req, res) => {
  const POST_PER_PAGE = 3; //kola page fiha 3 post
  const { pageNumber, category } = req.query;
  let posts;

  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
     .sort({ createdAt: -1 })
     .populate("user", ["-password"]);
  } else if (category) {
    posts = await Post.find({ category })
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else {
    posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("user", ["-password"]);
  }
  res.status(200).json(posts);
};

// get singl post
// route   /api/posts/:id
// method  get
// access  public
module.exports.getSinglePostCtrl = async (req, res) => {
  const post = await Post.findById(req.params.id)
  .populate("user", ["-password"])
  .populate("comments")
  
  
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  res.status(200).json(post);
};


// get posts count
// route   /api/posts/count
// method  get
// access  public
module.exports.getPostCountCtrl = async (req, res) => {
  const count = await Post.countDocuments();
  res.status(200).json(count);
};


// delet post
// route   /api/posts/:id
// method  delet
// access  private admin or user login
module.exports.deletePostCtrl = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  if (req.user.isAdmin || req.user.id === post.user.toString()) {
    await Post.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(post.image.publicId);

    // Delete all comments that belong to this post
    await Comment.deleteMany({ postId: post._id });

    res.status(200).json({
      message: "post has been deleted successfully",
      postId: post._id,
    });
  } else {
    res.status(403).json({ message: "access denied, forbidden" });
  }
};

/**-----------------------------------------------
 * @desc    Update Post
 * @route   /api/posts/:id
 * @method  PUT
 * @access  private only user login
 ------------------------------------------------*/
 module.exports.updatePostCtrl = async (req, res) => {
  // 1. Validation
  /*const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }*/

  // 2. Get the post from DB and check if post exist
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  // 3. check if this post belong to logged in user
  if (req.user.id !== post.user.toString()) {
    return res.status(403).json({ message: "access denied, you are not allowed" });
  }

  // 4. Update post
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      },
    },
    { new: true }
  ).populate("user", ["-password"])
  //.populate("comments");

  // 5. Send response to the client
  res.status(200).json(updatedPost);
};




/**-----------------------------------------------
 * @desc    Update Post Image
 * @route   /api/posts/upload-image/:id
 * @method  PUT
 * @access  private only user login
 ------------------------------------------------*/
 module.exports.updatePostImageCtrl = async (req, res) => {
  // 1. Validation
  if (!req.file) {
    return res.status(400).json({ message: "no image provided" });
  }

  // 2. Get the post from DB and check if post exist
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  // 3. Check if this post belong to logged in user
  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "access denied, you are not allowed" });
  }

  // 4. Delete the old image
  await cloudinaryRemoveImage(post.image.publicId);

  // 5. Upload new photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // 6. Update the image field in the db
  const updatedPost = await Post.findByIdAndUpdate(req.params.id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  );

  // 7. Send response to client
  res.status(200).json(updatedPost);

  // 8. Remvoe image from the server
  fs.unlinkSync(imagePath);
};


/**-----------------------------------------------
 * @desc     Like
 * @route   /api/posts/like/:id
 * @method  PUT
 * @access  private only user login
 ------------------------------------------------*/
 module.exports.toggleLikeCtrl = async (req, res) => {
  const loggedInUser = req.user.id;
  const { id: postId } = req.params;

  let post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  const isPostAlreadyLiked = post.likes.find((user) => user.toString() === loggedInUser );

  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loggedInUser },//pull fu mondo ky7yd value mn array
      },
      { new: true }
    );
  } else {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: loggedInUser },
      },
      { new: true }
    );
  }

  res.status(200).json(post);
};
