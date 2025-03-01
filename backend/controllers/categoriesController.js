const { Category} = require("../models/Category");

/**-----------------------------------------------
 * @desc    Create New Category
 * @route   /api/categories
 * @method  POST
 * @access  private (only admin)
 ------------------------------------------------*/
module.exports.createCategoryCtrl = async (req, res) => {
try{
    const category = await Category.create({
        title: req.body.title,
        user: req.user.id,
      });
    
      res.status(201).json(category);
}catch(err){
    res.status(400).json({message:err.message});
}

  
};

/**-----------------------------------------------
 * @desc    Get All Categories
 * @route   /api/categories
 * @method  GET
 * @access  public
 ------------------------------------------------*/
 module.exports.getAllCategoriesCtrl = async (req, res) => {
    const categories = await Category.find();
    res.status(200).json(categories);
  };
  
  /**-----------------------------------------------
   * @desc    Delete Category
   * @route   /api/categories/:id
   * @method  DELETE
   * @access  private (only admin)
   ------------------------------------------------*/
  module.exports.deleteCategoryCtrl = async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "category not found" });
    }
  
    await Category.findByIdAndDelete(req.params.id);
  
    res.status(200).json({
      message: "category has been deleted successfully",
      categoryId: category._id,
    });
  };