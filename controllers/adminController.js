const Admin = require("../models/Admin");
const User = require("../models/User");

// Create a new Admin
exports.createAdmin = async (req, res) => {
  try {
    const { user, managedManagers } = req.body;

    // Validate if user exists
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const admin = new Admin({ user, managedManagers });
    await admin.save();
    
    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all Admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().populate("user managedManagers");
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get Admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).populate("user managedManagers");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update Admin
exports.updateAdmin = async (req, res) => {
  try {
    const { managedManagers } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { managedManagers },
      { new: true }
    ).populate("user managedManagers");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    res.status(200).json({ message: "Admin updated successfully", admin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete Admin
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
