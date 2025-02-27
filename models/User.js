import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["employee", "manager", "admin"], required: true },
  phone: { type: String },
  dateOfJoining: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
