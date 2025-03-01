const mongoose = require("mongoose");
const Joi = require("joi");

// Category Schema
const CategorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});

// Category Model
const Category = mongoose.model("Category", CategorySchema);



module.exports = {
    Category,
    
}