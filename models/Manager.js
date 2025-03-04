import mongoose from "mongoose";

const ManagerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // ✅ Unique constraint
    password: { type: String, required: true },
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }], 
    targets: [{ period: String, amount: Number }],
    sales: [{ employeeId: mongoose.Schema.Types.ObjectId, amount: Number, date: Date }],
    contests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contest" }]
});

export default mongoose.model("Manager", ManagerSchema);
