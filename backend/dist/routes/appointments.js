"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
const Service_1 = __importDefault(require("../models/Service"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all appointments (Admin only)
router.get('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const appointments = await Appointment_1.default.find()
            .populate('user', 'name email phone')
            .populate('service', 'name duration price')
            .sort({ date: 1, startTime: 1 });
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar agendamentos',
            error: error.message
        });
    }
});
// Get user's appointments
router.get('/my-appointments', auth_1.authenticateToken, async (req, res) => {
    try {
        const appointments = await Appointment_1.default.find({ user: req.user?._id })
            .populate('service', 'name duration price')
            .sort({ date: 1, startTime: 1 });
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar seus agendamentos',
            error: error.message
        });
    }
});
// Create new appointment
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { serviceId, date, startTime, notes } = req.body;
        // Validate service exists
        const service = await Service_1.default.findById(serviceId);
        if (!service || !service.isActive) {
            return res.status(404).json({ message: 'Serviço não encontrado ou inativo' });
        }
        // Calculate end time
        const startHour = parseInt(startTime.split(':')[0]);
        const startMinute = parseInt(startTime.split(':')[1]);
        const totalStartMinutes = startHour * 60 + startMinute;
        const totalEndMinutes = totalStartMinutes + service.duration;
        const endHour = Math.floor(totalEndMinutes / 60);
        const endMinute = totalEndMinutes % 60;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        // Check for conflicts
        const appointmentDate = new Date(date);
        const existingAppointment = await Appointment_1.default.findOne({
            date: appointmentDate,
            status: { $in: ['pendente', 'confirmado'] },
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });
        if (existingAppointment) {
            return res.status(400).json({ message: 'Já existe um agendamento neste horário' });
        }
        const appointment = new Appointment_1.default({
            user: req.user?._id,
            service: serviceId,
            date: appointmentDate,
            startTime,
            endTime,
            notes,
            totalPrice: service.price
        });
        await appointment.save();
        await appointment.populate('service', 'name duration price');
        res.status(201).json({
            message: 'Agendamento criado com sucesso',
            appointment
        });
    }
    catch (error) {
        res.status(400).json({
            message: 'Erro ao criar agendamento',
            error: error.message
        });
    }
});
// Update appointment status (Admin only)
router.patch('/:id/status', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        const appointment = await Appointment_1.default.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).populate('user', 'name email phone')
            .populate('service', 'name duration price');
        if (!appointment) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }
        res.json({
            message: 'Status do agendamento atualizado',
            appointment
        });
    }
    catch (error) {
        res.status(400).json({
            message: 'Erro ao atualizar status',
            error: error.message
        });
    }
});
// Cancel appointment
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        const isAdmin = req.user?.role === 'admin';
        const query = { _id: id };
        if (!isAdmin) {
            query.user = userId;
        }
        const appointment = await Appointment_1.default.findOneAndUpdate(query, { status: 'cancelado' }, { new: true });
        if (!appointment) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }
        res.json({
            message: 'Agendamento cancelado com sucesso',
            appointment
        });
    }
    catch (error) {
        res.status(400).json({
            message: 'Erro ao cancelar agendamento',
            error: error.message
        });
    }
});
// Get available time slots
router.get('/available-slots/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const appointmentDate = new Date(date);
        // Get all appointments for this date
        const appointments = await Appointment_1.default.find({
            date: appointmentDate,
            status: { $in: ['pendente', 'confirmado'] }
        }).select('startTime endTime');
        // Define business hours (9:00 - 18:00)
        const businessStart = '09:00';
        const businessEnd = '18:00';
        const slotDuration = 30; // 30 minutes slots
        const availableSlots = [];
        let currentTime = businessStart;
        while (currentTime < businessEnd) {
            const currentHour = parseInt(currentTime.split(':')[0]);
            const currentMinute = parseInt(currentTime.split(':')[1]);
            const totalCurrentMinutes = currentHour * 60 + currentMinute;
            const totalSlotEndMinutes = totalCurrentMinutes + slotDuration;
            const slotEndHour = Math.floor(totalSlotEndMinutes / 60);
            const slotEndMinute = totalSlotEndMinutes % 60;
            const slotEnd = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}`;
            // Check if this slot conflicts with any appointment
            const hasConflict = appointments.some(appointment => {
                return currentTime < appointment.endTime && slotEnd > appointment.startTime;
            });
            if (!hasConflict && slotEnd <= businessEnd) {
                availableSlots.push(currentTime);
            }
            // Move to next slot
            const nextTotalMinutes = totalCurrentMinutes + slotDuration;
            const nextHour = Math.floor(nextTotalMinutes / 60);
            const nextMinute = nextTotalMinutes % 60;
            currentTime = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`;
        }
        res.json({ availableSlots });
    }
    catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar horários disponíveis',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=appointments.js.map