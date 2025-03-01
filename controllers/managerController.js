const Employee = require('../models/Employee');
const Contest = require('../models/Contest');

// Assign sales targets to employees
exports.assignTarget = async (req, res) => {
    try {
        const { employeeId, monthlyTarget, quarterlyTarget, yearlyTarget } = req.body;
        await Employee.findByIdAndUpdate(employeeId, { monthlyTarget, quarterlyTarget, yearlyTarget });
        res.json({ message: 'Target assigned successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get team performance
exports.getTeamPerformance = async (req, res) => {
    try {
        const employees = await Employee.find({ reportingManager: req.user.id }).populate('userId', 'name email');
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Send performance alerts to employees
exports.sendPerformanceAlert = async (req, res) => {
    try {
        const { employeeId, message } = req.body;
        // Logic to notify employee (email/notification system can be added)
        res.json({ message: Alert sent to employee ${employeeId}: ${message} });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Manage sales contests
exports.addContest = async (req, res) => {
    try {
        const contest = new Contest(req.body);
        await contest.save();
        res.status(201).json(contest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getContests = async (req, res) => {
    try {
        const contests = await Contest.find();
        res.json(contests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
