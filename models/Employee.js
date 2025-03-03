import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: { type: String, required: true },
    dateOfJoining: { type: Date, required: true },
    reportingManager: { type: String, required: true },
    monthlyTarget: { type: Number, default: 0 },
    quarterlyTarget: { type: Number, default: 0 },
    yearlyTarget: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    incentivesEarned: { type: Number, default: 0 },
    incentiveSlabs: { type: Array, default: [] } // Added field for incentives
}, { timestamps: true });

export default mongoose.model("Employees", EmployeeSchema);
