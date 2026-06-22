const Meeting = require('../models/Meeting');

// @desc    Schedule a Meeting
// @route   POST /api/meetings
const scheduleMeeting = async (req, res) => {
    const { title, description, investorId, startTime, endTime } = req.body;
    try {
        const start = new Date(startTime);
        const end = new Date(endTime);

        // Conflict Detection (Double Booking Check)
        const conflict = await Meeting.findOne({
            $or: [
                { investor: investorId, startTime: { $lt: end }, endTime: { $gt: start } },
                { entrepreneur: req.user.id, startTime: { $lt: end }, endTime: { $gt: start } }
            ],
            status: 'Accepted'
        });

        if (conflict) {
            return res.status(400).json({ message: 'Slot already booked! Time conflict detected.' });
        }

        const meeting = await Meeting.create({
            title,
            description,
            entrepreneur: req.user.id,
            investor: investorId,
            startTime: start,
            endTime: end,
            roomID: `room_${Math.random().toString(36).substring(2, 9)}`
        });

        res.status(201).json(meeting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get User Meetings
// @route   GET /api/meetings
const getMyMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find({
            $or: [{ entrepreneur: req.user.id }, { investor: req.user.id }]
        }).populate('entrepreneur investor', 'name email role');
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Meeting Status
// @route   PUT /api/meetings/:id
const updateMeetingStatus = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        meeting.status = req.body.status || meeting.status;
        const updatedMeeting = await meeting.save();
        res.json(updatedMeeting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { scheduleMeeting, getMyMeetings, updateMeetingStatus };