const Employee = require("../models/Employee");
const Sale = require("../models/Sale");
const Target = require("../models/Target");

// Create new employee data
exports.createEmployee = async (req, res) => {
    const employeeData = req.body;
    console.log("Incoming employee data:", employeeData);
    
    // Check for required fields
    if (!employeeData.name || !employeeData.position) {
        return res.status(400).json({ message: 'Name and position are required fields.' });
    }
    
    try {
        const employee = new Employee(employeeData);
        const result = await employee.save();
        res.status(201).json({ message: 'Employee data recorded', employee: result });
    } catch (error) {
        console.error("Error recording employee data:", error);
        if (error.name === 'ValidationError') {
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            res.status(400).json({ message: 'Validation error', errors: errors });
        } else if (error.code === 11000) {
            res.status(409).json({ message: 'Duplicate key error', error: error.message });
        } else {
            res.status(500).json({ message: 'Error recording employee data', error: error.message });
        }
    }
};

// Retrieve all employee data
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json({ message: 'List of employee data', employees });
    } catch (error) {
        console.error("Error retrieving employee data:", error);
        res.status(500).json({ message: 'Error retrieving employee data', error: error.message });
    }
};

// Retrieve employee data by ID
exports.getEmployeeById = async (req, res) => {
    const { id } = req.params;
    try {
        const employee = await Employee.findById(id);
        if (employee) {
            res.status(200).json({ message: 'Employee found', employee });
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        console.error("Error retrieving employee:", error);
        res.status(500).json({ message: 'Error retrieving employee', error: error.message });
    }
};

// Update employee data by ID
exports.updateEmployee = async (req, res) => {
    const { id } = req.params;
    const updatedEmployee = req.body;
    try {
        const employee = await Employee.findByIdAndUpdate(id, updatedEmployee, { new: true });
        if (employee) {
            res.status(200).json({ message: 'Employee updated', employee });
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        console.error("Error updating employee:", error);
        res.status(500).json({ message: 'Error updating employee', error: error.message });
    }
};

// Delete employee data by ID
exports.deleteEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Employee.findByIdAndDelete(id);
        if (result) {
            res.status(200).json({ message: 'Employee deleted' });
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        console.error("Error deleting employee:", error);
        res.status(500).json({ message: 'Error deleting employee', error: error.message });
    }
};

// Get Employee Dashboard Data
exports.getEmployeeDashboard = async (req, res) => {
    const employeeId = req.query.id;
    console.log("Employee ID:", employeeId);
    try {
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        const sales = await Sale.find({ employeeId });
        const targets = await Target.find({ employeeId });

        res.json({
            employee,
            sales,
            targets,
        });
    } catch (error) {
        console.error("Server Error in employee dashboard:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Fetch Sales Performance
exports.getSalesPerformance = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const sales = await Sale.find({ employeeId });

        const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);

        res.json({ totalSales, sales });
    } catch (error) {
        console.error("Server Error in sales performance:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Fetch Assigned Targets
exports.getTargets = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const targets = await Target.find({ employeeId });

        res.json(targets);
    } catch (error) {
        console.error("Server Error in get targets:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
