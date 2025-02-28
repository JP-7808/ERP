import express from "express";
import { registerAdmin, loginAdmin, getAdminProfile, logoutAdmin, updateAdmin, deleteAdmin 
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected Routes
router.get("/profile", authMiddleware, getAdminProfile);
router.post("/logout", authMiddleware, logoutAdmin);
router.put("/update", authMiddleware, updateAdmin);
router.delete("/delete", authMiddleware, deleteAdmin);

export default router;

