import express from 'express';
import Appointment from '../models/Appointment';
import Service from '../models/Service';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all appointments (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('user', 'name email phone')
      .populate('service', 'name duration price')
      .sort({ date: 1, startTime: 1 });

    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar agendamentos',
      error: error.message 
    });
  }
});

// Get user's appointments
router.get('/my-appointments', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user?._id })
      .populate('service', 'name duration price')
      .sort({ date: 1, startTime: 1 });

    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar seus agendamentos',
      error: error.message 
    });
  }
});

// Create new appointment
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { serviceId, date, startTime, notes } = req.body;

    // Validate service exists
    const service = await Service.findById(serviceId);
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
    const existingAppointment = await Appointment.findOne({
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

    const appointment = new Appointment({
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
  } catch (error: any) {
    res.status(400).json({ 
      message: 'Erro ao criar agendamento',
      error: error.message 
    });
  }
});

// Update appointment status (Admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone')
     .populate('service', 'name duration price');

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    res.json({
      message: 'Status do agendamento atualizado',
      appointment
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: 'Erro ao atualizar status',
      error: error.message 
    });
  }
});

// Cancel appointment
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const isAdmin = req.user?.role === 'admin';

    const query: any = { _id: id };
    if (!isAdmin) {
      query.user = userId;
    }

    const appointment = await Appointment.findOneAndUpdate(
      query,
      { status: 'cancelado' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    res.json({
      message: 'Agendamento cancelado com sucesso',
      appointment
    });
  } catch (error: any) {
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
    const appointments = await Appointment.find({
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
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar horários disponíveis',
      error: error.message 
    });
  }
});

export default router;
