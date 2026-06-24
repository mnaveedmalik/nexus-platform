const Meeting = require('../models/Meeting');

// @desc    Schedule a Meeting with watertight Double-Booking check
// @route   POST /api/meetings
const scheduleMeeting = async (req, res) => {
    const { title, description, investorId, startTime, endTime } = req.body;
    try {
        const start = new Date(startTime);
        const end = new Date(endTime);

        // Validation: Check if dates are valid and start is before end
        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({ message: 'Invalid date or time format provided' });
        }
        if (start >= end) {
            return res.status(400).json({ message: 'Start time must be strictly before end time' });
        }

        // Conflict Detection Check: 
        // It will detect conflict if the meeting is NOT Cancelled or Rejected (captures Pending & Accepted)
        const conflict = await Meeting.findOne({
            $or: [
                { investor: investorId, startTime: { $lt: end }, endTime: { $gt: start } },
                { entrepreneur: req.user.id, startTime: { $lt: end }, endTime: { $gt: start } }
            ],
            status: { $nin: ['Cancelled', 'Rejected'] } // Block slots for both Pending and Accepted meetings
        });

        if (conflict) {
            return res.status(400).json({ message: 'Slot already booked! Time conflict detected.' });
        }

        // If no conflict, create the unique meeting record
        const meeting = await Meeting.create({
            title,
            description,
            entrepreneur: req.user.id,
            investor: investorId,
            startTime: start,
            endTime: end,
            roomID: `room_${Math.random().toString(36).substring(2, 9)}` // Dynamic unique room ID for Sockets
        });

        return res.status(201).json(meeting);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get User Meetings (Investor or Entrepreneur context)
// @route   GET /api/meetings
const getMyMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find({
            $or: [{ entrepreneur: req.user.id }, { investor: req.user.id }]
        }).populate('entrepreneur investor', 'name email role');

        return res.json(meetings);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Update Meeting Status (Accept/Reject/Cancel actions)
// @route   PUT /api/meetings/:id
const updateMeetingStatus = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        meeting.status = req.body.status || meeting.status;
        const updatedMeeting = await meeting.save();
        return res.json(updatedMeeting);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { scheduleMeeting, getMyMeetings, updateMeetingStatus };