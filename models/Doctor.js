import mongoose from 'mongoose'

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    specialty: {
        type: String,
        required: [true, 'Please provide a specialty'],
        enum: ['Medicine', 'Cardiologist', 'Neurologist', 'Pediatrician', 'Orthopedic', 'Dermatologist', 'Psychiatrist', 'General']
    },
    experience: {
        type: String,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    fee: {
        type: Number,
        required: [true, 'Please provide consultation fee']
    },
    rating: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5
    },
    available: {
        type: Boolean,
        default: true
    },
    availableSlots: [{
        day: String,
        slots: [String]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Doctor', doctorSchema);