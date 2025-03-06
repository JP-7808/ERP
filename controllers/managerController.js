import bcrypt from "bcryptjs";
import validator from "validator"
import Manager from "../models/Manager.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";

// ✅ Register a new manager
export const registerManager = async (req, res) => {
    try {
        const { name, email, password, phone, assignedTargets } = req.body;

        // Validate email format
        // if (!validator.isEmail(email)) {
        //     return res.status(400).json({ message: "Invalid email format" });
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
        
        // Check if the email already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with role 'manager'
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: "manager"
        });

        const savedUser = await newUser.save();

        // Create associated manager record
        const newManager = new Manager({
            user: savedUser._id,
            assignedTargets: assignedTargets || { monthly: 0, quarterly: 0, yearly: 0 },
            teamSales: 0,
            teamMembers: []
        });

        await newManager.save();

        res.status(201).json({ message: "Manager registered successfully", manager: newManager });
    } catch (error) {
        res.status(500).json({ message: "Error registering manager", error });
    }
};

// ✅ Get all managers
export const getAllManagers = async (req, res) => {
    try {
        const managers = await Manager.find().populate("user", "name email phone role");
        res.status(200).json(managers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching managers", error });
    }
};

// ✅ Get a specific manager by ID
export const getManagerById = async (req, res) => {
    try {
        const manager = await Manager.findById(req.params.id).populate("user teamMembers", "name email role");
        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }
        res.status(200).json(manager);
    } catch (error) {
        res.status(500).json({ message: "Error fetching manager details", error });
    }
};

// ✅ Update manager details
export const updateManager = async (req, res) => {
    try {
        const { assignedTargets } = req.body;
        const manager = await Manager.findByIdAndUpdate(req.params.id, { assignedTargets }, { new: true });

        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }

        res.status(200).json({ message: "Manager updated successfully", manager });
    } catch (error) {
        res.status(500).json({ message: "Error updating manager details", error });
    }
};

// ✅ Delete a manager
export const deleteManager = async (req, res) => {
    try {
        const manager = await Manager.findById(req.params.id);
        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }

        await User.findByIdAndDelete(manager.user);
        await Manager.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Manager deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting manager", error });
    }
};

// ✅ Assign sales targets to a manager
export const assignTargets = async (req, res) => {
    try {
        const { monthly, quarterly, yearly } = req.body;
        const manager = await Manager.findByIdAndUpdate(req.params.id, { assignedTargets: { monthly, quarterly, yearly } }, { new: true });

        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }

        res.status(200).json({ message: "Sales targets updated successfully", manager });
    } catch (error) {
        res.status(500).json({ message: "Error updating sales targets", error });
    }
};

// ✅ Add a team member to a manager
export const addTeamMember = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const manager = await Manager.findById(req.params.id);
        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }

        // Check if employee exists
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Update the employee's reporting manager
        employee.reportingManager = manager.user;
        await employee.save();

        // Add employee to manager's team
        manager.teamMembers.push(employee.user);
        await manager.save();

        res.status(200).json({ message: "Team member added successfully", manager });
    } catch (error) {
        res.status(500).json({ message: "Error adding team member", error });
    }
};

// ✅ Remove a team member from a manager
export const removeTeamMember = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const manager = await Manager.findById(req.params.id);
        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }

        // Remove employee from manager's team
        manager.teamMembers = manager.teamMembers.filter(memberId => memberId.toString() !== employeeId);
        await manager.save();

        // Update the employee's reporting manager to null
        await Employee.findByIdAndUpdate(employeeId, { reportingManager: null });

        res.status(200).json({ message: "Team member removed successfully", manager });
    } catch (error) {
        res.status(500).json({ message: "Error removing team member", error });
    }
};
