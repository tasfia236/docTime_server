import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Doctor from '../models/Doctor.js'

const router = express.Router()

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
}

// routes here
// POST - register (public access)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, role, specialty, experience, qualification, fee, availableSlots } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: role || 'patient'
        });
        if (role === 'doctor') {
            await Doctor.create({
                userId: user._id,
                name,
                specialty,
                experience,
                qualification,
                fee,
                availableSlots,
            });
        }


        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// POST - login (public access)
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Check for user
        const user = await User.findOne({ phone } || { email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid phone or password' });
        }

        // // Check if role matches
        // if (user.role !== role) {
        //     return res.status(401).json({ message: `Please login as ${user.role}` });
        // }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid phone or password' });
        }

        // Get additional info for doctor
        let additionalInfo = {};
        if (user.role === 'doctor') {
            const doctor = await Doctor.findOne({ userId: user._id });
            if (doctor) {
                additionalInfo.specialty = doctor.specialty;
            }
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                ...additionalInfo
            },
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


router.get('/me', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;