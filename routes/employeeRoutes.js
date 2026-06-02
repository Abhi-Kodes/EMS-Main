const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employeeController');
const authCtrl = require('../controllers/authController');
const deptCtrl = require('../controllers/departmentController');
const pageCtrl = require('../controllers/pageController');
const { isAuthenticated, redirectIfAuthenticated } = require('../middleware/auth');

router.get('/login', redirectIfAuthenticated, authCtrl.loginForm);
router.post('/login', redirectIfAuthenticated, authCtrl.login);
router.get('/register', authCtrl.registerForm);
router.post('/register', authCtrl.register);
router.post('/logout', authCtrl.logout);

router.use(isAuthenticated);

router.get('/', ctrl.dashboard);

router.get('/employees', ctrl.getAllEmployees);
router.get('/employees/search', ctrl.searchEmployee);
router.get('/employees/add', ctrl.addForm);
router.post('/employees/add', ctrl.addEmployee);
router.get('/employees/view/:id', ctrl.viewEmployee);
router.get('/employees/edit/:id', ctrl.editForm);
router.put('/employees/update/:id', ctrl.updateEmployee);
router.delete('/employees/delete/:id', ctrl.deleteEmployee);
router.post('/employees/toggle-status/:id', ctrl.toggleStatus);

router.get('/departments', deptCtrl.index);
router.post('/departments', deptCtrl.create);
router.put('/departments/:id', deptCtrl.update);
router.delete('/departments/:id', deptCtrl.remove);

router.get('/reports', pageCtrl.reports);
router.get('/settings', pageCtrl.settings);

module.exports = router;
