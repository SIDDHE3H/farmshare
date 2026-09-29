const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', equipmentController.getEquipment);
router.get('/my', authenticateToken, equipmentController.getMyEquipment);
router.get('/:id', equipmentController.getEquipmentById);

// Protected routes
router.post('/', authenticateToken, upload.single('image'), equipmentController.createEquipment);
router.put('/:id', authenticateToken, upload.single('image'), equipmentController.updateEquipment);
router.delete('/:id', authenticateToken, equipmentController.deleteEquipment);

module.exports = router;
