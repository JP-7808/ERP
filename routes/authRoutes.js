import express from "express";
import { registerUser, loginUser, getProfile, logoutUser } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Routes
router.get("/profile", authMiddleware, getProfile);
router.post("/logout", logoutUser);

export default router;
