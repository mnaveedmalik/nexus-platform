const express = require('express');
const { scheduleMeeting, getMyMeetings, updateMeetingStatus } = require('../controllers/meetingController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Chain structures ko hata kar simple explicit routes map kar diye hain
router.post('/', protect, scheduleMeeting);
router.get('/', protect, getMyMeetings);
router.put('/:id', protect, updateMeetingStatus);

module.exports = router;