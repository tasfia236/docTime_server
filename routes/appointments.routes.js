import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
    createAppointment,
    deleteAppointment,
    getAppointments,
    updateAppointmentStatus
} from "../controllers/appointment.controller.js";

const router = Router();

router.post("/", protect, createAppointment);
router.get("/", protect, getAppointments);
router.patch("/:id", protect, updateAppointmentStatus);
router.delete("/:id", protect, deleteAppointment);

export default router;
