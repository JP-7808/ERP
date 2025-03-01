import Sales from "../models/Sales.js";
import User from "../models/User.js";

// Create a new sale
export const createSale = async (req, res) => {
  try {
    const { customerName, customerPhone, productName, amount, paymentMode } = req.body;
    const sale = new Sales({ ...req.body, employee: req.user.id });

    await sale.save();
    res.status(201).json({ success: true, message: "Sale recorded successfully", sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all sales (Admin/Manager)
export const getAllSales = async (req, res) => {
  try {
    const sales = await Sales.find().populate("employee", "name email role");
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get sales by Employee
export const getSalesByEmployee = async (req, res) => {
  try {
    const sales = await Sales.find({ employee: req.user.id });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a sale
export const deleteSale = async (req, res) => {
  try {
    await Sales.findByIdAndDelete(req.params.id);
    res.json({ message: "Sale deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
