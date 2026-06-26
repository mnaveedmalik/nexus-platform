const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    entrepreneur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    investor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        /* 
           🚀 CRITICAL RE-CALIBRATION: 
           Adding 'Cancelled' and 'Completed' into the valid enum matrix 
           to allow seamless state synchronization from the frontend room portal.
        */
        enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Completed'],
        default: 'Pending'
    },
    roomID: {
        type: String,
        required: true
    } // Video calling room ID
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);