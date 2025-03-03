import express from "express";
import {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    assignTargets,
    getSalesPerformance,
    getIncentiveDetails
} from "../controllers/employeeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post('/', createEmployee);
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);
router.post('/:id/targets', assignTargets);
router.get('/:id/performance', getSalesPerformance);
router.get('/:id/incentives', getIncentiveDetails); // New route for incentives

export default router;

