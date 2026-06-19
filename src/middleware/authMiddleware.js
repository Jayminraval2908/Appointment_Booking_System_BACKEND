const jwt = require('jsonwebtoken');

const verifyToken = (req,res,next)=>{
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message:"Access Denied.No Valid Token"
            })
            
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        req.user = decoded;
        next();
    
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message:"Token expired.Please login again."
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                message:"Invalid token.Please login again."
            })
        }

        return res.status(500).json({
            message:error.message
        })
    }
}

const requireRole = (...roles)=>{
    return (req,res,next)=>{
        if (!req.user) {
            return res.status(401).json({
                message:"Unauthorize. Please login first.",
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message:`Access denied.Only ${roles.join(" or")} can access this.`
            })
        }

        next();
    }
}


module.exports ={verifyToken, requireRole}