import express from 'express'

import { protect, authorize } from '../middleware/auth.js'
import {
    changePassword,
    deleteAccount,
    getAllUsers,
    getPatients,
    getProfile,
    updateProfile
} from '../controllers/user.controller.js'
import User from '../models/User.js'

const router = express.Router()

router.get('/profile', protect, getProfile)
router.get('/patients', protect, authorize('admin', 'receptionist'), getPatients)

router.put('/profile', protect, updateProfile)
router.put('/change-password', protect, changePassword)
router.delete('/account', protect, deleteAccount)

// Admin only
router.get('/all', protect, authorize('admin'), getAllUsers)

// DELETE user by ID (Admin)
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
})

export default router
