const express = require('express');
const employeesController = require('./employeesController'); 
const { authenticate } = require('../authMiddleware'); 

const router = express.Router();

// Create new employee data
router.post('/', authenticate, employeesController.createEmployee);

// Retrieve all employee data
router.get('/', authenticate, employeesController.getAllEmployees);

// Retrieve employee data by ID
router.get('/:id', authenticate, employeesController.getEmployeeById);

// Update employee data by ID
router.put('/:id', authenticate, employeesController.updateEmployee);

// Delete employee data by ID
router.delete('/:id', authenticate, employeesController.deleteEmployee);

// Get Employee Dashboard Data
router.get('/dashboard', authenticate, employeesController.getEmployeeDashboard);

module.exports = router;
