import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js'; // Capitalized for convention

// Signup Controller
const signup = async (req, res) => {
  const { FullName, Email, Password } = req.body;

  try {
    if (Password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    const newUser = new User({
      FullName,
      Email,
      Password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        FullName: newUser.FullName,
        Email: newUser.Email,
      });
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Login Controller (not implemented yet)
const login = async (req, res) => {
  const { Email, Password } = req.body;
  // Login logic here
  res.send("User logged in");
};

// Logout Controller (not implemented yet)
const logout = async (req, res) => {
  // Logout logic here
  res.send("User logged out");
};

export { signup, login, logout };
