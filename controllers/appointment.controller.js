import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

/* ===============================
   CREATE APPOINTMENT (Patient)
================================ */
export const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, day, time, notes } = req.body;

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        const patient = req.user; // from auth middleware

        const exists = await Appointment.findOne({
            doctorId,
            date,
            time,
            status: { $ne: "cancelled" }
        });

        if (exists) {
            return res.status(400).json({ message: "Time slot already booked" });
        }

        const appointment = await Appointment.create({
            patientId: patient._id,
            patientName: patient.name,
            patientNumber: patient.phone,
            doctorId,
            doctorName: doctor.name,
            specialty: doctor.specialty,
            date,
            day,
            time,
            notes
        });

        res.status(201).json({ success: true, appointment });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



/* ===============================
   GET APPOINTMENT (Role based)
================================ */
export const getAppointments = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === "patient") {
            query.patientId = req.user.id;
        }

        if (req.user.role === "doctor") {
            const doctor = await Doctor.findOne({ userId: req.user.id });
            query.doctorId = doctor._id;
        }

        // Admin / Receptionist → see all

        const appointments = await Appointment.find(query)
            .sort({ date: -1, createdAt: -1 });

        res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


/* ===============================
   UPDATE STATUS (Doctor, Admin, Receptionist)
================================ */
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (
            req.user.role === "patient" &&
            status !== "cancelled"
        ) {
            return res.status(403).json({ message: "Not allowed" });
        }

        appointment.status = status;
        appointment.updatedBy = req.user.role;

        await appointment.save();

        res.json({ success: true, appointment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


/* ==============================
   DELETE (ADMIN / PATIENT OWN)
================================ */
export const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
        if (!appointment) return res.status(404).json({ message: "Appointment not found" })

        if (
            req.user.role === "patient" &&
            appointment.patientId.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: "Not authorized" })
        }

        await appointment.deleteOne()
        res.json({ success: true, message: "Appointment deleted" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}