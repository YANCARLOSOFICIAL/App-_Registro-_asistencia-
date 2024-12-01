const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    isVerifiedByFacialRecognition: { type: Boolean, default: false } // Indicar si fue con reconocimiento facial
});

const Attendance = mongoose.model('Attendance', AttendanceSchema);
module.exports = Attendance;
