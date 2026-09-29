const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, requestController.createRequest);
router.get('/my-requests', authenticateToken, requestController.getMyRequests);
router.get('/received', authenticateToken, requestController.getReceivedRequests);
router.put('/:id/status', authenticateToken, requestController.updateRequestStatus);
router.put('/:id/cancel', authenticateToken, requestController.cancelRequest);

module.exports = router;
