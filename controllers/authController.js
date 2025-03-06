import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import validator from "validator";
import Admin from "../models/Admin.js";
import Manager from "../models/Manager.js";
import Employee from "../models/Employee.js";

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, designation, reportingManager } = req.body;

    // Validate required fields based on role
    // if (role === "employee" && (!designation || !reportingManager)) {
    //   return res.status(400).json({ message: "Employee role requires designation and reportingManager" });
    // }
    
    // Validate email format
    // if (!validator.isEmail(email)) {
    //   return res.status(400).json({ message: "Invalid email format" });
    // }

    // Validate email format and domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@einfratech\.(tech|com)$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email must end with @einfratech.tech or @einfratech.com" });
    }

    // Validate password strength
    if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }


    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
    });

    await newUser.save();

    // Create role-based entries
    if (role === "admin") {
      await Admin.create({ user: newUser._id, managedManagers: [] });
    } else if (role === "manager") {
      await Manager.create({ user: newUser._id, teamMembers: [] });
    } else if (role === "employee") {
      await Employee.create({
        user: newUser._id,
        designation,
        reportingManager,
        monthlyTarget: 0,
        quarterlyTarget: 0,
        yearlyTarget: 0,
        totalSales: 0,
        incentiveSlabs: [],
      });
    }

    res.status(201).json({ message: "User registered successfully", user: newUser });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie('access_token', token,{
        httpOnly: true,
        secure:true,
        sameSite: 'None'
    })
    .status(200)
    .json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get User Profile (Protected)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Logout User (Secure)
export const logoutUser = (req, res) => {
  res.cookie("access_token", "", { 
    httpOnly: true, 
    secure: true, 
    sameSite: 'None', 
    expires: new Date(0) 
  });
  res.status(200).json({ message: "Logged out successfully" });
};
