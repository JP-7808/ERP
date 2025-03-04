import bcrypt from "bcryptjs";
import Employee from "../models/Employee.js";
import User from "../models/User.js";

// Register a new employee
export const registerEmployee = async (req, res) => {
    try {
        const { name, email, password, phone, designation, reportingManager, monthlyTarget, quarterlyTarget, yearlyTarget, incentiveSlabs } = req.body;

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
