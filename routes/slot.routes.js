import { Router } from 'express';
import { authorize, protect } from '../middleware/auth.js';
import Doctor from '../models/Doctor.js';
const router = Router();

/* ===================================================
   GET: Get Current Doctor Slots
   Private (Doctor only)
   =================================================== */
router.get('/my-slots', protect, authorize('doctor'), async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id });

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        res.json({ success: true, available: doctor.available, slots: doctor.availableSlots });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/* ===================================================
   PATCH: Toggle Availability
   Private (Doctor only)
   =================================================== */
router.patch('/toggle-availability', protect, authorize('doctor'), async (req, res) => {
    try {
        const doctor = await Doctor.findOneAndUpdate(
            { userId: req.user._id },
            { available: req.body.available },
            { new: true }
        );

        res.json({ success: true, available: doctor.available });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/* ===================================================
   PATCH: Update Slots
   Private (Doctor only)
   =================================================== */
router.patch('/update-slots', protect, authorize('doctor'), async (req, res) => {
    try {
        const { day, slots } = req.body;

        if (!day || !Array.isArray(slots)) {
            return res.status(400).json({ success: false, message: 'Day and slots are required' });
        }

        const doctor = await Doctor.findOne({ userId: req.user._id });

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        // Update or add day slots
        const existingDay = doctor.availableSlots.find(s => s.day === day);
        if (existingDay) {
            existingDay.slots = slots;
        } else {
            doctor.availableSlots.push({ day, slots });
        }

        await doctor.save();
        res.json({ success: true, slots: doctor.availableSlots });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
