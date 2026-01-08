import User from '../models/User.js'
import Doctor from '../models/Doctor.js'

export const getProfile = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    let profile = { ...user.toObject() }

    if (user.role === 'doctor') {
        profile.doctorInfo = await Doctor.findOne({ userId: user._id })
    }

    res.json({ success: true, profile })
}

export const getPatients = async (req, res) => {
    const patients = await User.find({ role: 'patient' }).select('-password')
    res.json({ success: true, users: patients })
}

export const updateProfile = async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user.id,
        req.body,
        { new: true, runValidators: true }
    ).select('-password')

    res.json({ success: true, user })
}

export const changePassword = async (req, res) => {
    const user = await User.findById(req.user.id).select('+password')
    const isMatch = await user.comparePassword(req.body.currentPassword)
    if (!isMatch) return res.status(401).json({ message: 'Wrong password' })

    user.password = req.body.newPassword
    await user.save()

    res.json({ success: true })
}

export const deleteAccount = async (req, res) => {
    const user = await User.findById(req.user.id)
    if (user.role === 'doctor') {
        await Doctor.findOneAndDelete({ userId: user._id })
    }
    await user.deleteOne()
    res.json({ success: true })
}

export const getAllUsers = async (req, res) => {
    const users = await User.find().select('-password')
    res.json({ success: true, users })
}
