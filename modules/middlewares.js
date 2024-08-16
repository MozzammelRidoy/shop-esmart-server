import "dotenv/config";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

// user token verify
export const verifyToken = async (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized Access" });
      }
      req.user = decoded;
      next();
    });
  } catch (err) {
    return res.status(400).send({ message: "Access Denied" });
  }
};

// user type Manager Check 
export const isManager = async(req, res, next) => {
    if(req.user.type !== 'manager'){
        return res.status(405).send({ message: "Method Not Allowed" });
    }
    next();
}

//user type admin check
export const isAdmin = async(req, res, next) => {
    if(req.user.type !== 'admin'){
        return res.status(405).send({ message: "Method Not Allowed" });
    }
    next();
}

// user type moderator check
export const isModerator = async(req, res, next) => {
    if(req.user.type !== 'moderator'){
        return res.status(405).send({ message: "Method Not Allowed" });
    }
    next();
}

// user type user check and user access block 
export const isUserBlocked = async(req, res, next) => {
    if(req.user.type === 'user'){
        return res.status(405).send({ message: "Method Not Allowed" });
    }
    next();
}

// login limiter
export const limiter = rateLimit({
    windowMs : 5 * 60 * 100, 
    limit : 10,
    standardHeaders : 'draft-7',
    legacyHeaders : false
})
