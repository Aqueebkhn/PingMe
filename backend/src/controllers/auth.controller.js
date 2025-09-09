import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js';
import cloudinary from '../lib/cloudinary.js';

// Signup Controller
 const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password || password.length < 6) {
      return res.status(400).json({ message: "All field required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
    });

  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Login Controller
 const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic || null,
    });

  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Logout Controller
 const logout = async (req, res) => {
   try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProfile = async (req, res) => {
   try {
       const { profilePic} = req.body;
       const userId = req.user._id;

       if(!profilePic){
           return res.status(400).json({message: "Profile picture is required"});
       }

          const uploadResponse =await cloudinary.uploader.upload(profilePic,);
          const updatedUser = await User.findByIdAndUpdate(
              userId,
              {profilePic: uploadResponse.secure_url},
              {new: true}
          ).select("-password");

   }catch (error) {
       console.error("updatedProfile Error:", error.message, "inavlid data" );
       res.status(500).json({message: "Server error" });
   }
}

const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { checkAuth, signup, login, logout, updateProfile };
