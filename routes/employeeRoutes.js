import express from "express";
import { 
    getAllEmployees, 
    getEmployeeById, 
    updateEmployee, 
    deleteEmployee, 
    getEmployeePerformance, 
    updateTargets,
    registerEmployee 
} from "../controllers/employeeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// Register a new employee (Only managers and admins can create employees)
router.post("/register", authMiddleware, roleMiddleware(["manager", "admin"]), registerEmployee);

// Get all employees (Only managers and admins can access)
router.get("/", authMiddleware, roleMiddleware(["manager", "admin"]), getAllEmployees);

// Get a specific employee's details (Only the employee, manager, or admin can access)
router.get("/:id", authMiddleware, getEmployeeById);

// Update an employee's details (Only managers and admins can update)
router.put("/:id", authMiddleware, roleMiddleware(["manager", "admin"]), updateEmployee);

// Delete an employee (Only admins can delete)
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteEmployee);

// Get employee performance metrics
router.get("/:id/performance", authMiddleware, getEmployeePerformance);

// Update employee targets (Only managers and admins can modify targets)
router.put("/:id/targets", authMiddleware, roleMiddleware(["manager", "admin"]), updateTargets);

export default router;
