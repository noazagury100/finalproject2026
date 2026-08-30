const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

router.get('/', groupController.getAllGroups);
router.post('/', groupController.createGroup);
router.post('/:groupId/join', groupController.joinGroup);
router.delete('/:groupId', groupController.deleteGroup);
router.get('/locations', groupController.getGroupsLocations);

module.exports = router;