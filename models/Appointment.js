import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    patientNumber: {
        type: String,
    },
    doctorName: {
        type: String,
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: [true, 'Please provide appointment date']
    },
    day: {
        type: String, // Sunday, Monday etc
        required: true
    },
    time: {
        type: String,
        required: [true, 'Please provide appointment time']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Appointment', appointmentSchema);
