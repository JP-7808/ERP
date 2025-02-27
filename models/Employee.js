const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  designation: { type: String, required: true },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  monthlyTarget: { type: Number, default: 0 },
  quarterlyTarget: { type: Number, default: 0 },
  yearlyTarget: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  incentiveSlabs: { type: Array, default: [] },
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);
