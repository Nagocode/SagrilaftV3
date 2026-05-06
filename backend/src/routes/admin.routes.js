const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

router.get('/users', verifyToken, isAdmin, adminController.getUsers);
router.put('/documents/:id/status', verifyToken, isAdmin, adminController.updateDocumentStatus);
router.get('/logs', verifyToken, isAdmin, adminController.getLogs);
router.get('/logs/download', verifyToken, isAdmin, adminController.downloadLogs);
router.post('/users/admin', verifyToken, isAdmin, adminController.createAdmin);
router.get('/users/admins', verifyToken, isAdmin, adminController.getAdminsList);
router.delete('/users/admins/:id', verifyToken, isAdmin, adminController.deleteAdmin);

module.exports = router;
