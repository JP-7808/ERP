import express from "express";
import { createSale, getAllSales, getSalesByEmployee, deleteSale } from "../controllers/salesController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createSale);
router.get("/", authMiddleware, roleMiddleware(["manager", "admin"]), getAllSales);
router.get("/my-sales", authMiddleware, getSalesByEmployee);
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteSale);

export default router;
