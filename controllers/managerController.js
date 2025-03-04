import Manager from "../models/manager.js";

import User from "../models/User.js";
import bcrypt from "bcrypt"; // Import bcrypt


export const addManager = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // ✅ Check if email already exists
        const existingManager = await Manager.findOne({ email });
        if (existingManager) {
            return res.status(400).json({ error: "Email already in use. Please use a different email." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newManager = new Manager({ name, email, password: hashedPassword });
        await newManager.save();

        res.status(201).json({ message: "Manager added successfully", manager: newManager });
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(400).json({ error: "Email already in use. Please choose another email." });
        }
        res.status(500).json({ error: error.message });
    }
};

export const assignTarget = async (req, res) => {
    try {
        const { managerId, period, amount } = req.body;
        const manager = await Manager.findById(managerId);

        if (!manager) return res.status(404).json({ message: "Manager not found" });

        manager.targets.push({ period, amount });
        await manager.save();

        res.status(200).json({ message: "Target assigned successfully", targets: manager.targets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const trackSales = async (req, res) => {
    try {
        const { managerId } = req.params;
        const manager = await Manager.findById(managerId);

        if (!manager) return res.status(404).json({ message: "Manager not found" });

        res.status(200).json({ sales: manager.sales });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const sendAlert = async (req, res) => {
    try {
        const { managerId, employeeId, message } = req.body;
        console.log(`Alert to Employee ${employeeId}: ${message}`);


        
        res.status(200).json({ message: `Alert sent to employee ${employeeId}` });


    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const manageContests = async (req, res) => {
    try {
        const { managerId, contestId } = req.body;
        const manager = await Manager.findById(managerId);

        if (!manager) return res.status(404).json({ message: "Manager not found" });

        manager.contests.push(contestId);
        await manager.save();

        res.status(200).json({ message: "Contest added successfully", contests: manager.contests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllManagers = async (req, res) => {
    try {
        const managers = await Manager.find(); // Retrieve all managers
        res.status(200).json(managers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPerformance = async (req, res) => {

    try {
        const { managerId } = req.params;
        const manager = await Manager.findById(managerId).populate("team");

        if (!manager) return res.status(404).json({ message: "Manager not found" });

        let totalSales = manager.sales.reduce((sum, sale) => sum + sale.amount, 0);
        let totalTarget = manager.targets.reduce((sum, target) => sum + target.amount, 0);

        let performance = totalSales >= totalTarget ? "Excellent" : "Needs Improvement";

        res.status(200).json({ manager, totalSales, totalTarget, performance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
