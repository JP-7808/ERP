import express from "express";

import {
    addManager,
    assignTarget,
    trackSales,
    sendAlert,
    manageContests,
    getPerformance,
    getAllManagers 
} from "../controllers/managerController.js"; // Updated to correct import



const router = express.Router();

router.get("/", getAllManagers); // Link to the function that retrieves all managers


router.post("/add", addManager);

router.post("/assign-target", assignTarget);
router.get("/sales/:managerId", trackSales);
router.post("/send-alert", sendAlert);
router.post("/manage-contests", manageContests);
router.get("/performance/:managerId", getPerformance);

export default router;
