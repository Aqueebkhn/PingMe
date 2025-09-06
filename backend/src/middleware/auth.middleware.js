import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const protectRoutes = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({message: "Not authorized, no token"});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded){
            return res.status(401).json({message: "Not authorized, token failed"});
        }

        const user = await User.findById(decoded.id).select('-password');
        if(!user){
            return res.status(401).json({message: "Not authorized, user not found"});
        }
        req.User = User;
        next();

    }catch(error){
        console.error("Auth Middleware Error:", error.message);
        res.status(500).json({message: "Server error"});

    }
}

export default protectRoutes;