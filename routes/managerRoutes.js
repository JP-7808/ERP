const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const authMiddleware = require('../middleware/authMiddleware');

// Assign targets to employees
router.post('/assign-target', authMiddleware.verifyManager, managerController.assignTarget);

// Get team performance
router.get('/team-performance', authMiddleware.verifyManager, managerController.getTeamPerformance);

// Send alerts to underperforming employees
router.post('/send-alert', authMiddleware.verifyManager, managerController.sendPerformanceAlert);

// Manage sales contests
router.post('/add-contest', authMiddleware.verifyManager, managerController.addContest);
router.get('/contests', authMiddleware.verifyManager, managerController.getContests);

module.exports = router;
