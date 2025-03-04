import express from "express";
import { 
    registerManager, 
    getAllManagers, 
    getManagerById, 
    updateManager, 
    deleteManager, 
    assignTargets, 
    addTeamMember, 
    removeTeamMember 
} from "../controllers/managerController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

//  Register a new manager (Only admins can create managers)
router.post("/register", authMiddleware, roleMiddleware(["admin"]), registerManager);

//  Get all managers (Only admins can view)
router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllManagers);

//  Get a specific manager (Admins and the manager themselves can view)
router.get("/:id", authMiddleware, getManagerById);

//  Update manager details (Only admins can update)
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updateManager);

//  Delete a manager (Only admins can delete)
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteManager);

//  Assign sales targets to a manager (Only admins can assign targets)
router.put("/:id/targets", authMiddleware, roleMiddleware(["admin"]), assignTargets);

//  Add a team member to a manager's team (Only admins can add)
router.put("/:id/addTeamMember", authMiddleware, roleMiddleware(["admin"]), addTeamMember);

//  Remove a team member from a manager's team (Only admins can remove)
router.put("/:id/removeTeamMember", authMiddleware, roleMiddleware(["admin"]), removeTeamMember);

export default router;
