import express from "express";
import AdminController from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Protect all routes with auth and admin role middleware
router.use(authMiddleware);
router.use(roleMiddleware(["admin"]));

// Dashboard Routes
router.get("/dashboard", AdminController.getDashboard);
router.post("/assign-targets", AdminController.assignTargets);
router.post("/add-manager", AdminController.addManager);
router.delete("/remove-manager/:managerId", AdminController.removeManager);
router.post("/add-employee", AdminController.addEmployee);
router.delete("/remove-employee/:employeeId", AdminController.removeEmployee);
router.post("/sales", AdminController.createSale);
router.put("/sales/:saleId", AdminController.updateSale);
router.delete("/sales/:saleId", AdminController.deleteSale);
router.post("/update-incentives", AdminController.updateEmployeeIncentives); // Renamed for clarity
router.post("/update-manager-incentives", AdminController.updateManagerIncentives); // New
router.get("/performance-reports", AdminController.getPerformanceReports);
router.get("/managers", AdminController.viewAllManagers); // New
router.post("/manager-targets", AdminController.addSalesTargetToManager); // New
router.get("/employees", AdminController.viewAllEmployees); // New
router.post("/employee-targets", AdminController.addSalesTargetToEmployee); // New
router.get("/sales", AdminController.viewAllSales); // New
router.get("/employee-performance", AdminController.getEmployeePerformance); // New
router.get("/manager-performance", AdminController.getManagerPerformance); // New

export default router;

