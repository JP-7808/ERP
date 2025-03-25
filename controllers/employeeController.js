import bcrypt from "bcryptjs";
import validator from "validator"
import Employee from "../models/Employee.js";
import User from "../models/User.js";

// Register a new employee
export const registerEmployee = async (req, res) => {
    try {
        const { name, email, password, phone, designation, reportingManager, monthlyTarget, quarterlyTarget, yearlyTarget, incentiveSlabs } = req.body;

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

        // Create user with role 'employee'
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: "employee"
        });

        const savedUser = await newUser.save();

        // Create associated employee record
        const newEmployee = new Employee({
            user: savedUser._id,
            designation,
            reportingManager,
            monthlyTarget: monthlyTarget || 0,
            quarterlyTarget: quarterlyTarget || 0,
            yearlyTarget: yearlyTarget || 0,
            totalSales: 0,
            incentiveSlabs: incentiveSlabs || []
        });

        await newEmployee.save();

        res.status(201).json({ message: "Employee registered successfully", employee: newEmployee });
    } catch (error) {
        res.status(500).json({ message: "Error registering employee", error });
    }
};

// Get all employees
export const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().populate("user reportingManager", "name email role");
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: "Error fetching employees", error });
    }
};

// Get a specific employee by ID
export const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id).populate("user reportingManager", "name email role");
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: "Error fetching employee details", error });
    }
};

// Update employee details
export const updateEmployee = async (req, res) => {
    try {
        const { designation, reportingManager, incentiveSlabs } = req.body;
        const employee = await Employee.findByIdAndUpdate(req.params.id, { designation, reportingManager, incentiveSlabs }, { new: true });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({ message: "Employee updated successfully", employee });
    } catch (error) {
        res.status(500).json({ message: "Error updating employee details", error });
    }
};

// Delete an employee
export const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        await User.findByIdAndDelete(employee.user);
        await Employee.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting employee", error });
    }
};

// Get employee performance metrics
export const getEmployeePerformance = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const performanceData = {
            monthlyTarget: employee.monthlyTarget,
            quarterlyTarget: employee.quarterlyTarget,
            yearlyTarget: employee.yearlyTarget,
            totalSales: employee.totalSales,
            incentiveSlabs: employee.incentiveSlabs,
        };

        res.status(200).json(performanceData);
    } catch (error) {
        res.status(500).json({ message: "Error fetching employee performance data", error });
    }
};

// Update employee targets
export const updateTargets = async (req, res) => {
    try {
        const { monthlyTarget, quarterlyTarget, yearlyTarget } = req.body;
        const employee = await Employee.findByIdAndUpdate(req.params.id, { monthlyTarget, quarterlyTarget, yearlyTarget }, { new: true });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({ message: "Employee targets updated successfully", employee });
    } catch (error) {
        res.status(500).json({ message: "Error updating employee targets", error });
    }
};

export const findEmployeeByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find the Employee where the `user` field matches the given `userId`
        const employee = await Employee.findOne({ user: userId });

        if (!employee) {
            return res.status(404).json({ message: "Employee record not found." });
        }

        res.status(200).json({ employeeId: employee._id });
    } catch (error) {
        console.error("Error fetching employee ID:", error);
        res.status(500).json({ message: "Server error", error });
    }
};
