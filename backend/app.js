const express = require("express");
const connectToDb = require("./config/connectToDb");
const cors = require("cors");
require("dotenv").config();
const { errorHandler, notFound } = require("./middlewares/error");

//connection to mongodb
connectToDb();

//init app
const app=express();


//middlewares
app.use(express.json());

// Cors Policy
app.use(cors({
    origin: "http://localhost:3000"
  }));


//route
app.use("/api/auth",require("./routes/authRoute"))
app.use("/api/users",require("./routes/usersRoute"))
app.use("/api/posts",require("./routes/postsRoute"))
app.use("/api/comments",require("./routes/commentRoute"))
app.use("/api/categories", require("./routes/categoriesRoute"));




// Error Handler Middleware
app.use(notFound);
app.use(errorHandler);



//run server
const PORT = process.env.PORT || 8000
app.listen(PORT,()=>
    console.log("serve is running")
)