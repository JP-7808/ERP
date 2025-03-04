import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Manager from "../models/Manager.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Sales from "../models/Sales.js";
import SalesContest from "../models/SalesContest.js";

class AdminController {
  // Get Admin Dashboard Data
  static async getDashboard(req, res) {
    try {
      const admin = await Admin.findOne({ user: req.user._id }).populate({
        path: "managedManagers",
        populate: {
          path: "teamMembers",
          model: "User",
        },
      });

      const totalManagers = admin.managedManagers.length;
      const totalEmployees = await Employee.countDocuments();
      const totalSales = await Sales.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      res.status(200).json({
        managers: admin.managedManagers,
        totalManagers,
        totalEmployees,
        totalSales: totalSales[0]?.total || 0,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard data", error });
    }
  }

  // Assign Targets to Manager (Existing)
  static async assignTargets(req, res) {
    try {
      const { managerId, monthly, quarterly, yearly } = req.body;

      const manager = await Manager.findOneAndUpdate(
        { user: managerId },
        {
          $set: {
            "assignedTargets.monthly": monthly,
            "assignedTargets.quarterly": quarterly,
            "assignedTargets.yearly": yearly,
          },
        },
        { new: true }
      );

      if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
      }

      res.status(200).json({ message: "Targets assigned successfully", manager });
    } catch (error) {
      res.status(500).json({ message: "Error assigning targets", error });
    }
  }

  // Add Manager (Existing)
  static async addManager(req, res) {
    try {
      const { name, email, password, phone } = req.body;

      const user = await User.create({
        name,
        email,
        password,
        role: "manager",
        phone,
      });

      const manager = await Manager.create({ user: user._id });

      await Admin.findOneAndUpdate(
        { user: req.user._id },
        { $push: { managedManagers: user._id } }
      );

      res.status(201).json({ message: "Manager added successfully", manager });
    } catch (error) {
      res.status(500).json({ message: "Error adding manager", error });
    }
  }

  // Remove Manager (Existing)
  static async removeManager(req, res) {
    try {
      const { managerId } = req.params;

      await Manager.findOneAndDelete({ user: managerId });
      await User.findByIdAndDelete(managerId);
      await Admin.findOneAndUpdate(
        { user: req.user._id },
        { $pull: { managedManagers: managerId } }
      );

      res.status(200).json({ message: "Manager removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error removing manager", error });
    }
  }

  // Add Employee (Existing)
  static async addEmployee(req, res) {
    try {
      const { name, email, password, phone, designation, reportingManager } = req.body;

      const manager = await Manager.findOne({ user: reportingManager });
      if (!manager) {
        return res.status(400).json({ message: "Invalid reporting manager" });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: "employee",
        phone,
      });

      const employee = await Employee.create({
        user: user._id,
        designation,
        reportingManager,
      });

      await Manager.findOneAndUpdate(
        { user: reportingManager },
        { $push: { teamMembers: user._id } }
      );

      res.status(201).json({ message: "Employee added successfully", employee });
    } catch (error) {
      res.status(500).json({ message: "Error adding employee", error });
    }
  }

  // Remove Employee (Existing)
  static async removeEmployee(req, res) {
    try {
      const { employeeId } = req.params;

      const employee = await Employee.findOne({ user: employeeId });
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      await Manager.findOneAndUpdate(
        { user: employee.reportingManager },
        { $pull: { teamMembers: employeeId } }
      );

      await Employee.findOneAndDelete({ user: employeeId });
      await User.findByIdAndDelete(employeeId);

      res.status(200).json({ message: "Employee removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error removing employee", error });
    }
  }

  // Create Sale (Existing)
  static async createSale(req, res) {
    try {
      const {
        employee,
        customerName,
        customerPhone,
        customerEmail,
        nomineeDetails,
        productName,
        amount,
        premiumPaymentTerm,
        paymentMode,
      } = req.body;

      const sale = await Sales.create({
        employee,
        customerName,
        customerPhone,
        customerEmail,
        nomineeDetails,
        productName,
        amount,
        premiumPaymentTerm,
        paymentMode,
      });

      await Employee.findOneAndUpdate(
        { user: employee },
        { $inc: { totalSales: amount } }
      );

      res.status(201).json({ message: "Sale created successfully", sale });
    } catch (error) {
      res.status(500).json({ message: "Error creating sale", error });
    }
  }

  // Update Sale (Existing)
  static async updateSale(req, res) {
    try {
      const { saleId } = req.params;
      const updateData = req.body;

      const oldSale = await Sales.findById(saleId);
      if (!oldSale) {
        return res.status(404).json({ message: "Sale not found" });
      }

      const updatedSale = await Sales.findByIdAndUpdate(saleId, updateData, { new: true });

      if (updateData.amount && updateData.amount !== oldSale.amount) {
        const amountDiff = updateData.amount - oldSale.amount;
        await Employee.findOneAndUpdate(
          { user: oldSale.employee },
          { $inc: { totalSales: amountDiff } }
        );
      }

      res.status(200).json({ message: "Sale updated successfully", updatedSale });
    } catch (error) {
      res.status(500).json({ message: "Error updating sale", error });
    }
  }

  // Delete Sale (Existing)
  static async deleteSale(req, res) {
    try {
      const { saleId } = req.params;

      const sale = await Sales.findByIdAndDelete(saleId);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }

      await Employee.findOneAndUpdate(
        { user: sale.employee },
        { $inc: { totalSales: -sale.amount } }
      );

      res.status(200).json({ message: "Sale deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting sale", error });
    }
  }

  // Update Incentives (Existing for Employee)
  static async updateIncentives(req, res) {
    try {
      const { employeeId, incentiveSlabs } = req.body;

      const employee = await Employee.findOneAndUpdate(
        { user: employeeId },
        { incentiveSlabs },
        { new: true }
      );

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.status(200).json({ message: "Incentives updated successfully", employee });
    } catch (error) {
      res.status(500).json({ message: "Error updating incentives", error });
    }
  }

  // Get Performance Reports (Existing)
  static async getPerformanceReports(req, res) {
    try {
      const salesByManager = await Manager.aggregate([
        {
          $lookup: {
            from: "sales",
            localField: "user",
            foreignField: "employee",
            as: "managerSales",
          },
        },
        {
          $lookup: {
            from: "employees",
            localField: "teamMembers",
            foreignField: "user",
            as: "teamDetails",
          },
        },
        {
          $lookup: {
            from: "sales",
            localField: "teamMembers",
            foreignField: "employee",
            as: "teamSalesDetails",
          },
        },
        {
          $project: {
            name: "$user.name",
            totalSales: { $sum: "$managerSales.amount" },
            teamSales: "$teamSales",
            assignedTargets: 1,
            teamPerformance: {
              $map: {
                input: "$teamDetails",
                as: "emp",
                in: {
                  employeeName: "$$emp.user.name",
                  designation: "$$emp.designation",
                  sales: {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: "$teamSalesDetails",
                            cond: { $eq: ["$$this.employee", "$$emp.user"] },
                          },
                        },
                        as: "sale",
                        in: "$$sale.amount",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ]);

      res.status(200).json({ reports: salesByManager });
    } catch (error) {
      res.status(500).json({ message: "Error fetching reports", error });
    }
  }

  // New: View All Managers
  static async viewAllManagers(req, res) {
    try {
      const managers = await Manager.find().populate({
        path: "user",
        select: "name email role phone",
      }).populate({
        path: "teamMembers",
        select: "name email role",
        model: "User",
      });

      res.status(200).json({ message: "Managers retrieved successfully", managers });
    } catch (error) {
      res.status(500).json({ message: "Error fetching managers", error });
    }
  }

  // New: Add Sales Target to Manager
  static async addSalesTargetToManager(req, res) {
    try {
      const { managerId, monthly, quarterly, yearly } = req.body;

      const manager = await Manager.findOneAndUpdate(
        { user: managerId },
        {
          $set: {
            "assignedTargets.monthly": monthly,
            "assignedTargets.quarterly": quarterly,
            "assignedTargets.yearly": yearly,
          },
        },
        { new: true, runValidators: true }
      );

      if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
      }

      res.status(200).json({ message: "Sales target added to manager successfully", manager });
    } catch (error) {
      res.status(500).json({ message: "Error adding sales target to manager", error });
    }
  }

  // New: View All Employees
  static async viewAllEmployees(req, res) {
    try {
      const employees = await Employee.find().populate({
        path: "user",
        select: "name email role phone",
      }).populate({
        path: "reportingManager",
        select: "name email role",
        model: "User",
      });

      res.status(200).json({ message: "Employees retrieved successfully", employees });
    } catch (error) {
      res.status(500).json({ message: "Error fetching employees", error });
    }
  }

  // New: Add Sales Target to Employee
  static async addSalesTargetToEmployee(req, res) {
    try {
      const { employeeId, monthly, quarterly, yearly } = req.body;

      const employee = await Employee.findOneAndUpdate(
        { user: employeeId },
        {
          $set: {
            monthlyTarget: monthly,
            quarterlyTarget: quarterly,
            yearlyTarget: yearly,
          },
        },
        { new: true, runValidators: true }
      );

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.status(200).json({ message: "Sales target added to employee successfully", employee });
    } catch (error) {
      res.status(500).json({ message: "Error adding sales target to employee", error });
    }
  }

  // New: View All Sales
  static async viewAllSales(req, res) {
    try {
      const sales = await Sales.find().populate({
        path: "employee",
        select: "name email role",
        model: "User",
      });

      res.status(200).json({ message: "Sales retrieved successfully", sales });
    } catch (error) {
      res.status(500).json({ message: "Error fetching sales", error });
    }
  }

  // New: Update Incentives of Employee (Existing method renamed for clarity)
  static async updateEmployeeIncentives(req, res) {
    try {
      const { employeeId, incentiveSlabs } = req.body;

      const employee = await Employee.findOneAndUpdate(
        { user: employeeId },
        { incentiveSlabs },
        { new: true }
      );

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.status(200).json({ message: "Employee incentives updated successfully", employee });
    } catch (error) {
      res.status(500).json({ message: "Error updating employee incentives", error });
    }
  }

  // New: Update Incentives for Manager
  static async updateManagerIncentives(req, res) {
    try {
      const { managerId, incentiveSlabs } = req.body;

      // Note: The Manager schema doesn't have an 'incentiveSlabs' field by default.
      // We'll add it as a custom field or extend the schema if needed.
      const manager = await Manager.findOneAndUpdate(
        { user: managerId },
        { incentiveSlabs },  // Adding incentiveSlabs as a new field
        { new: true, upsert: true }  // Use upsert to create if not exists
      );

      if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
      }

      res.status(200).json({ message: "Manager incentives updated successfully", manager });
    } catch (error) {
      res.status(500).json({ message: "Error updating manager incentives", error });
    }
  }

  // New: Get Performance of Employees
  static async getEmployeePerformance(req, res) {
    try {
      const employees = await Employee.find().populate({
        path: "user",
        select: "name email role",
      }).populate({
        path: "reportingManager",
        select: "name email role",
        model: "User",
      });

      const performanceData = employees.map(employee => ({
        employeeName: employee.user.name,
        designation: employee.designation,
        totalSales: employee.totalSales,
        monthlyTarget: employee.monthlyTarget,
        quarterlyTarget: employee.quarterlyTarget,
        yearlyTarget: employee.yearlyTarget,
        performance: {
          monthly: employee.totalSales >= employee.monthlyTarget ? "Met" : "Not Met",
          quarterly: employee.totalSales >= employee.quarterlyTarget ? "Met" : "Not Met",
          yearly: employee.totalSales >= employee.yearlyTarget ? "Met" : "Not Met",
        },
        incentivesEarned: employee.incentivesEarned,
      }));

      res.status(200).json({ message: "Employee performance retrieved successfully", performance: performanceData });
    } catch (error) {
      res.status(500).json({ message: "Error fetching employee performance", error });
    }
  }

  // New: Get Performance of Managers
  static async getManagerPerformance(req, res) {
    try {
      const managers = await Manager.find().populate({
        path: "user",
        select: "name email role",
      }).populate({
        path: "teamMembers",
        select: "name email role",
        model: "User",
      });

      const performanceData = managers.map(manager => ({
        managerName: manager.user.name,
        totalSales: manager.teamSales,
        teamSales: manager.teamSales,
        assignedTargets: manager.assignedTargets,
        performance: {
          monthly: manager.teamSales >= manager.assignedTargets.monthly ? "Met" : "Not Met",
          quarterly: manager.teamSales >= manager.assignedTargets.quarterly ? "Met" : "Not Met",
          yearly: manager.teamSales >= manager.assignedTargets.yearly ? "Met" : "Not Met",
        },
        teamMembers: manager.teamMembers.map(member => member.name),
      }));

      res.status(200).json({ message: "Manager performance retrieved successfully", performance: performanceData });
    } catch (error) {
      res.status(500).json({ message: "Error fetching manager performance", error });
    }
  }
}

export default AdminController;
