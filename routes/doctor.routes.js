import { Router } from 'express';
import Doctor from '../models/Doctor.js';
import { authorize, protect } from '../middleware/auth.js';
const router = Router();


/* ===================================================
   POST: Create Doctor
   =================================================== */
router.post('/', async (req, res) => {
    try {
        const doctor = await Doctor.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Doctor created successfully',
            doctor
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});


// @access  Public
router.get('/all', async (req, res) => {
    try {
        const { specialty, search } = req.query;

        let query = {};

        if (specialty && specialty !== 'all') {
            query.specialty = specialty;
        }

        if (search) {
            query.$or = [
                { role: { $regex: search, $options: 'i' } },
                { specialty: { $regex: search, $options: 'i' } }
            ];
        }
        const doctors = await Doctor.find(query).sort({ rating: -1 }).populate('userId', 'phone email role');;

        res.json({
            success: true,
            count: doctors.length,
            doctors
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


router.get('/:id', async (req, res) => {
    const doctor = await Doctor.findById(req.params.id)
        .populate('userId', 'email')
    res.json({ success: true, doctor })
})


// @access  Private (Doctor only)
router.patch('/:id', protect, authorize('doctor', 'admin'), async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            doctor: updatedDoctor
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/specialties/list', async (req, res) => {
    try {
        const specialties = await Doctor.distinct('specialty');
        res.json({
            success: true,
            specialties
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


/* ===================================================
   DELETE: Doctor
   =================================================== */
router.delete('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Doctor deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid doctor ID'
        });

    }
});




export default router;