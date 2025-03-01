const jwt = require("jsonwebtoken");


// verify Token

function verifyToken(req,res,next){
    const authToken = req.headers.authorization;
    if(authToken){
        const token= authToken.split(" ")[1]
        try{
            req.user   = jwt.verify(token, process.env.JWT_SECRET) 
            next();
        }catch(err){ 
            return res.status(500).json({message:"in valid"})
        }

    }else{
        return res.status(401).json({message:"no token"})
    }
}


//verfify token & Admin

function verifyTokenAndAdmin(req, res, next){
        verifyToken(req, res, ()=>{
            if(req.user.isAdmin){
                next();
            }else{
                return res.status(403).json({message:"not admin"})
            }

        });

}


//verfify token user  login

function verifyTokenAndOnlyUser(req, res, next){
    verifyToken(req, res, ()=>{
        if(req.user.id === req.params.id){
            next();
        }else{
            return res.status(403).json({message:"not user"})
        }

    });
}


// Verify Token & Authorization admin or user login
function verifyTokenAndAuthorization(req, res, next) {
    verifyToken(req, res, () => {
      if (req.user.id === req.params.id || req.user.isAdmin) {
        next();
      } else {
        return res.status(403).json({ message: "not allowed, only user himself or admin" });
      }
    });
  }


module.exports ={
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndOnlyUser,
    verifyTokenAndAuthorization
    

}