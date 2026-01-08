export const detectIntent = (message) => {
    const text = message.toLowerCase();

    // Check for doctor names or specialties first
    const doctorKeywords = ['dr.', 'doctor', 'physician', 'specialist'];
    const hasDoctorMention = doctorKeywords.some(keyword => text.includes(keyword));

    if (hasDoctorMention && (text.includes("fee") || text.includes("cost") || text.includes("price"))) {
        return "FEE";
    }

    if (hasDoctorMention && (text.includes("available") || text.includes("slot") || text.includes("schedule"))) {
        return "AVAILABILITY";
    }

    if (hasDoctorMention && (text.includes("book") || text.includes("book") || text.includes("appointment") || text.includes("reserve"))) {
        return "BOOK";
    }

    if (text.includes("book") || text.includes("booking") || text.includes("appointment") || text.includes("reserve") || text.includes("schedule")) {
        return "BOOK";
    }

    if (text.includes("available") || text.includes("slot") || text.includes("schedule") || text.includes("timing")) {
        return "AVAILABILITY";
    }

    if (text.includes("fee") || text.includes("cost") || text.includes("price") || text.includes("charge")) {
        return "FEE";
    }

    if (text.match(/^(hello|hi|hey|good morning|good afternoon|good evening)/) ||
        text.includes("hello") || text.includes("hi ")) {
        return "GREETING";
    }

    if (text.includes("details") || text.includes("information") || text.includes("about")) {
        return "DETAILS";
    }

    return "AI";
};