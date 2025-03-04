// const mongoose = require("mongoose");

import mongoose from "mongoose";

const managerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  assignedTargets: {
    monthly: { type: Number, default: 0 },
    quarterly: { type: Number, default: 0 },
    yearly: { type: Number, default: 0 }
  },
  teamSales: { type: Number, default: 0 },
}, { timestamps: true });

// module.exports = mongoose.model("Manager", managerSchema);
export default mongoose.model('Manager', managerSchema);
