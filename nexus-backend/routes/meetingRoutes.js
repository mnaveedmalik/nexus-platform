const express = require('express');
const { scheduleMeeting, getMyMeetings, updateMeetingStatus } = require('../controllers/meetingController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/').post(protect, scheduleMeeting).get(protect, getMyMeetings);
router.route('/:id').put(protect, updateMeetingStatus);

module.exports = router;