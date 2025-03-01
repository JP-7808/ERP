const express = require('express');
const employeesController = require('./employeesController'); 
const router = express.Router();

router.post('/', employeesController.createEmployee);

router.get('/', employeesController.getAllEmployees);

router.get('/:id', employeesController.getEmployeeById);

router.put('/:id', employeesController.updateEmployee);

router.delete('/:id', employeesController.deleteEmployee);

router.get('/dashboard', employeesController.getEmployeeDashboard);

module.exports = router;
