import dotenv from "dotenv";
dotenv.config()

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'


import authRoutes from './routes/auth.js'
import doctorRoutes from './routes/doctor.routes.js'
import appointmentRoutes from './routes/appointments.routes.js'
import userRoutes from './routes/user.routes.js'
import slotRoutes from './routes/slot.routes.js'
import chatRoutes from './routes/chatbot.routes.js'

const port = 5000
const app = express()


// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://doc-time-iota.vercel.app'],
    methods: ['GET', 'PATCH', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect MongoDB
mongoose.connect(process.env.MONGO)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err))



// Routes
app.use('/api/auth', authRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/user', userRoutes)
app.use('/api/slots', slotRoutes)
app.use('/api/chat', chatRoutes)

// Welcome route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Doctor Appointment System API',
        version: '1.0.0'
    })
})

// Error handler middleware (should be last)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    })
})

app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`)
})