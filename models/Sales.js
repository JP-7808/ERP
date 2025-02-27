const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  nomineeDetails: { type: String },
  productName: { type: String, required: true },
  dateOfSale: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  premiumPaymentTerm: { type: String },
  paymentMode: { type: String, enum: ["monthly", "quarterly", "yearly"], required: true },
}, { timestamps: true });

module.exports = mongoose.model("Sales", salesSchema);
