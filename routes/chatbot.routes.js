// Update this section in your backend route
import dotenv from "dotenv";
dotenv.config()
import express from "express";
import OpenAI from "openai";
import Chat from "../models/Chat.js";
import Doctor from "../models/Doctor.js";
import { detectIntent } from "../utils/intentDetector.js";

const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Helper function to format doctor details
const formatDoctorDetails = (doctor) => {
    // Format available slots
    let formattedSlots = "Not available";
    if (doctor.availableSlots && Array.isArray(doctor.availableSlots)) {
        console.log(doctor)
        formattedSlots = doctor.availableSlots
            .map(slot => `${slot.day}: ${slot.slots.join(', ')}`)
            .join('\n');
    } else if (typeof doctor.availableSlots === 'string') {
        formattedSlots = doctor.availableSlots;
    }

    return `
👨‍⚕️ *${doctor.name}*
🎯 Specialty: ${doctor.specialty}
💰 Consultation Fee: $${doctor.fee}
⏰ Available Slots:\n${formattedSlots}
⭐ Rating: ${doctor.rating || 4.5}/5
📍 Location: ${doctor.location || "Main Hospital"}
📞 Contact: ${doctor.userId?.phone || "Not provided"}
    `.trim();
};


// Helper function to format slots for summary
const formatSlotsForSummary = (slots) => {
    if (!slots) return "No slots available";

    if (Array.isArray(slots)) {
        // Take only first 2 slots for summary
        const firstTwoSlots = slots.slice(0, 2);
        return firstTwoSlots
            .map(slot => `${slot.day}: ${slot.slots[0]}`)
            .join(', ');
    }

    return typeof slots === 'string' ? slots : "Check for availability";
};

router.post("/", async (req, res) => {
    const { message } = req.body;
    const intent = detectIntent(message);
    let reply = "";

    try {
        // Check if message contains doctor names or specialties
        const doctors = await Doctor.find()
            .populate('userId', 'phone email name')
            .select('-__v'); // Exclude __v field

        // Check for doctor mentions in the message
        const mentionedDoctor = doctors.find(doctor =>
            message.toLowerCase().includes(doctor.name.toLowerCase()) ||
            (doctor.specialty && message.toLowerCase().includes(doctor.specialty.toLowerCase()))
        );

        if (intent === "GREETING") {
            reply = "Hello 👋! Welcome to MediCare Assistant! How can I help you with your healthcare needs today? You can ask about:\n• Doctor availability\n• Consultation fees\n• Booking appointments\n• Doctor details";

        } else if (intent === "AVAILABILITY") {
            if (mentionedDoctor) {
                const formattedSlots = mentionedDoctor.availableSlots && Array.isArray(mentionedDoctor.availableSlots)
                    ? mentionedDoctor.availableSlots
                        .map(slot => `  ${slot.day}: ${slot.slots.join(', ')}`)
                        .join('\n')
                    : "No specific slots available";

                reply = `${mentionedDoctor.name} - (${mentionedDoctor.specialty}) is available:\n${formattedSlots}\n\nWould you like to book an appointment?`;
            } else if (message.toLowerCase().includes("all") || message.toLowerCase().includes("list")) {
                if (doctors.length > 0) {
                    const doctorList = doctors.map(doc =>
                        `• ${doc.name} - ${doc.specialty}\n  Available: ${formatSlotsForSummary(doc.availableSlots)}`
                    ).join('\n\n');
                    reply = `Available Doctors:\n\n${doctorList}\n\nPlease tell me which doctor you're interested in for more details or booking.`;
                } else {
                    reply = "Currently no doctors are available. Please check back later.";
                }
            } else {
                const availableDoctors = doctors.slice(0, 5); // Show top 5
                if (availableDoctors.length > 0) {
                    const doctorSummary = availableDoctors.map(doc => {
                        const slotsSummary = formatSlotsForSummary(doc.availableSlots);
                        return `• ${doc.name} - ${doc.specialty}\n  Next available: ${slotsSummary}`;
                    }).join('\n\n');

                    reply = `Doctors currently available:\n\n${doctorSummary}\n\nWould you like details about a specific doctor or help with booking?`;
                } else {
                    reply = "No doctors available at the moment. Our regular hours are 9 AM - 6 PM, Monday to Saturday.";
                }
            }

        } else if (intent === "FEE") {
            if (mentionedDoctor) {
                reply = `Consultation fee for ${mentionedDoctor.name} - (${mentionedDoctor.specialty}): ৳${mentionedDoctor.fee} \n\nThis includes:\n• Initial consultation\n• Basic examination\n• Follow-up recommendations\n\nWould you like to see available slots for booking?`;
            } else {
                const feeList = doctors.slice(0, 3).map(doc =>
                    `${doc.name} - (${doc.specialty}): ৳${doc.fee}`
                ).join('\n');
                reply = `Consultation Fees: \n${feeList}\n\nPlease tell me which doctor you're asking about for exact fee details.`;
            }

        } else if (intent === "BOOK") {
            if (mentionedDoctor) {
                const formattedSlots = mentionedDoctor.availableSlots && Array.isArray(mentionedDoctor.availableSlots)
                    ? mentionedDoctor.availableSlots
                        .map(slot => `  ${slot.day}: ${slot.slots.join(', ')}`)
                        .join('\n')
                    : "No specific slots available";

                reply = `Excellent choice! ${mentionedDoctor.name} is a specialist in ${mentionedDoctor.specialty}.\n\n Available slots for booking: \n${formattedSlots}\n\nPlease reply with your preferred day and time to confirm the appointment.\n\nExample: "Book Tuesday at 02:00 PM"`;
            } else {
                const topDoctors = doctors.slice(0, 3).map(doc => {
                    const slotsSummary = formatSlotsForSummary(doc.availableSlots);
                    return `• ${doc.name} - ${doc.specialty}\n  Available: ${slotsSummary}`;
                }).join('\n\n');

                reply = `I can help you book an appointment! \n\nHere are some available doctors:\n\n${topDoctors}\n\nWhich doctor would you like to book with? You can also ask for more details about any doctor.`;
            }

        } else if (mentionedDoctor) {
            // Show detailed doctor information when specifically mentioned
            reply = formatDoctorDetails(mentionedDoctor);

        } else {
            // OpenAI API fallback for general queries
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: `You are a medical appointment assistant. Keep responses helpful, concise, and focused on healthcare, appointments, doctors, and medical services. 
                    Available doctors: ${doctors.map(d => `${d.name} (${d.specialty})`).join(', ')}.
                    If someone asks about non-medical topics, politely steer them back to medical services.`
                }, {
                    role: "user",
                    content: message
                }]
            });

            reply = response.choices[0].message.content;
        }

        // Save to chat history
        await Chat.create({
            userMessage: message,
            botReply: reply,
            intent: mentionedDoctor ? "DOCTOR_DETAILS" : intent,
            metadata: mentionedDoctor ? { doctorId: mentionedDoctor._id } : {}
        });

        res.json({
            reply,
            doctor: mentionedDoctor ? {
                name: mentionedDoctor.name,
                specialty: mentionedDoctor.specialty,
                fee: mentionedDoctor.fee,
                availableSlots: mentionedDoctor.availableSlots,
                rating: mentionedDoctor.rating || 4.5,
                location: mentionedDoctor.location,
                phone: mentionedDoctor.userId?.phone || null
            } : null
        });

    } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        res.status(500).json({
            reply: "I apologize for the inconvenience. Our system is experiencing temporary issues. Please try again in a few moments or contact our support team directly at support@medicare.com for immediate assistance.",
            doctor: null
        });
    }
});

export default router;