// controllers/meetingController.js
const Meeting = require('../models/Meeting');
const User = require('../models/User');

// @desc    Schedule a Meeting with watertight Double-Booking check
// @route   POST /api/meetings
const scheduleMeeting = async (req, res) => {
    const { title, description, investorId, startTime, endTime, inviteeEmail } = req.body;
    try {
        let targetInvestorId = investorId;

        /* Email Resolution Pipeline: If frontend sends inviteeEmail instead of direct MongoDB Object ID,
           we look up the exact Investor account inside the database seamlessly.
        */
        if (!targetInvestorId && inviteeEmail) {
            const resolvedUser = await User.findOne({ email: inviteeEmail.trim().toLowerCase() });
            if (!resolvedUser) {
                return res.status(404).json({ message: 'Invitee user account not found in system directory' });
            }
            targetInvestorId = resolvedUser._id;
        }

        if (!targetInvestorId) {
            return res.status(400).json({ message: 'Investor identification reference missing' });
        }

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
        const conflict = await Meeting.findOne({
            $or: [
                { investor: targetInvestorId, startTime: { $lt: end }, endTime: { $gt: start } },
                { entrepreneur: req.user.id, startTime: { $lt: end }, endTime: { $gt: start } }
            ],
            /* 🚀 CRITICAL VALIDATION FIX:
               Adding 'Completed' into the $nin (Not In) array gate!
               Ab database 'Cancelled', 'Rejected', aur 'Completed' teeno ko ignore karega 
               aur naya handshake slot baghair kisi conflict crash ke book karne dega!
            */
            status: { $nin: ['Cancelled', 'Rejected', 'Completed'] }
        });

        if (conflict) {
            return res.status(400).json({ message: 'Slot already booked! Time conflict detected.' });
        }

        // If no conflict, create the unique meeting record
        const meeting = await Meeting.create({
            title,
            description: description || 'No description provided',
            entrepreneur: req.user.id,
            investor: targetInvestorId,
            startTime: start,
            endTime: end,
            roomID: `room_${Math.random().toString(36).substring(2, 9)}`
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
        const meetingId = req.params.id;

        if (!meetingId) {
            return res.status(400).json({ message: 'Meeting ID configuration parameter is required.' });
        }

        const updatedMeeting = await Meeting.findByIdAndUpdate(
            meetingId,
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        if (!updatedMeeting) {
            return res.status(404).json({ message: 'Meeting not found in the timeline ledger directory.' });
        }

        return res.json(updatedMeeting);
    } catch (error) {
        console.error("CRITICAL PIPELINE FAULT - updateMeetingStatus Runtime Exception:", error.message);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { scheduleMeeting, getMyMeetings, updateMeetingStatus };