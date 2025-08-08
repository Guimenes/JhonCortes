import express from 'express';
import Appointment from '../models/Appointment';
import Service from '../models/Service';
import { Schedule, Unavailability } from '../models/Schedule';
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
    const appointmentDate = new Date(date + 'T12:00:00');
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
    const { serviceId } = req.query;
    
    // Criar data no fuso horário local para evitar problemas de timezone
    const appointmentDate = new Date(date + 'T12:00:00');
    const dayOfWeek = appointmentDate.getDay();

    // Buscar horário de funcionamento para o dia da semana
    const schedule = await Schedule.findOne({ dayOfWeek, isActive: true });
    if (!schedule) {
      console.log(`No schedule found for dayOfWeek: ${dayOfWeek}`);
      return res.json({ availableSlots: [] });
    }

    // Buscar informações do serviço para obter a duração
    let serviceDuration = 30; // duração padrão em minutos
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (service) {
        serviceDuration = service.duration;
      }
    }

    console.log(`Schedule found: ${schedule.startTime} - ${schedule.endTime}, Service duration: ${serviceDuration} minutes`);

    // Buscar indisponibilidades para a data específica
    const searchDate = new Date(date + 'T12:00:00');
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const unavailabilities = await Unavailability.find({
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      isActive: true
    });

    console.log(`Found ${unavailabilities.length} unavailabilities`);

    // Buscar agendamentos existentes para a data
    const appointments = await Appointment.find({
      date: appointmentDate,
      status: { $in: ['pendente', 'confirmado'] }
    }).select('startTime endTime');

    console.log(`Found ${appointments.length} existing appointments`);

    // Gerar slots disponíveis baseado na duração do serviço
    const slots = [];
    const startTime = new Date(`1970-01-01T${schedule.startTime}:00`);
    const endTime = new Date(`1970-01-01T${schedule.endTime}:00`);
    
    console.log(`Generating slots from ${schedule.startTime} to ${schedule.endTime} with ${serviceDuration} minute intervals`);
    
    let currentTime = new Date(startTime);
    
    // Loop deve parar quando o slot + duração do serviço ultrapassar o horário de fim
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      
      // Calcular o fim do slot baseado na duração do serviço
      const slotEnd = new Date(currentTime.getTime() + serviceDuration * 60000);
      const slotEndString = slotEnd.toTimeString().slice(0, 5);
      
      // Se o slot + duração ultrapassa o horário de funcionamento, parar
      if (slotEnd > endTime) {
        console.log(`Slot ${timeString}-${slotEndString} exceeds end time ${schedule.endTime}, stopping`);
        break;
      }
      
      // Verificar se todo o período do serviço não está em indisponibilidade
      const isUnavailable = unavailabilities.some((unavail: any) => {
        const unavailStart = new Date(`1970-01-01T${unavail.startTime}:00`);
        const unavailEnd = new Date(`1970-01-01T${unavail.endTime}:00`);
        // Se qualquer parte do slot conflita com indisponibilidade
        return !(slotEnd <= unavailStart || currentTime >= unavailEnd);
      });

      // Verificar se não há conflito com agendamentos existentes
      const hasAppointmentConflict = appointments.some(appointment => {
        const appointmentStart = new Date(`1970-01-01T${appointment.startTime}:00`);
        const appointmentEnd = new Date(`1970-01-01T${appointment.endTime}:00`);
        // Se qualquer parte do slot conflita com agendamento existente
        return !(slotEnd <= appointmentStart || currentTime >= appointmentEnd);
      });

      console.log(`Checking slot ${timeString}-${slotEndString}: unavailable=${isUnavailable}, conflict=${hasAppointmentConflict}`);

      if (!isUnavailable && !hasAppointmentConflict) {
        slots.push(timeString);
      }

      // Avançar em intervalos menores (15 minutos) para dar mais opções de horário
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }

    console.log(`Generated ${slots.length} available slots:`, slots);
    res.json({ availableSlots: slots });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar horários disponíveis',
      error: error.message 
    });
  }
});

// Check if a date has unavailabilities or is not a working day
router.get('/check-date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const appointmentDate = new Date(date + 'T12:00:00');
    const dayOfWeek = appointmentDate.getDay();

    // Check if it's a working day
    const schedule = await Schedule.findOne({ dayOfWeek, isActive: true });
    const isWorkingDay = !!schedule;

    // Check for unavailabilities
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const unavailabilities = await Unavailability.find({
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      isActive: true
    });

    const hasUnavailability = unavailabilities.length > 0;
    
    // Check if the entire day is blocked by unavailabilities
    let isCompletelyBlocked = false;
    if (schedule && hasUnavailability) {
      const scheduleStart = new Date(`1970-01-01T${schedule.startTime}:00`);
      const scheduleEnd = new Date(`1970-01-01T${schedule.endTime}:00`);
      const scheduleDuration = scheduleEnd.getTime() - scheduleStart.getTime();
      
      // Calculate total unavailable time, considering overlaps
      const sortedUnavailabilities = unavailabilities
        .map(u => ({
          start: new Date(`1970-01-01T${u.startTime}:00`).getTime(),
          end: new Date(`1970-01-01T${u.endTime}:00`).getTime()
        }))
        .sort((a, b) => a.start - b.start);
      
      let totalUnavailableDuration = 0;
      let lastEnd = 0;
      
      for (const unavail of sortedUnavailabilities) {
        const start = Math.max(unavail.start, lastEnd);
        const end = unavail.end;
        
        if (start < end) {
          totalUnavailableDuration += end - start;
          lastEnd = end;
        }
      }
      
      // Consider completely blocked if 90% or more of the day is unavailable
      isCompletelyBlocked = totalUnavailableDuration >= (scheduleDuration * 0.9);
    }

    // Check if all time slots are occupied by appointments
    let hasAvailableSlots = true;
    if (schedule && !isCompletelyBlocked) {
      // Get all existing appointments for the date
      const appointments = await Appointment.find({
        date: appointmentDate,
        status: { $in: ['pendente', 'confirmado'] }
      }).select('startTime endTime');

      // Generate slots with a short duration (15 minutes) to check availability
      const slots = [];
      const startTime = new Date(`1970-01-01T${schedule.startTime}:00`);
      const endTime = new Date(`1970-01-01T${schedule.endTime}:00`);
      const slotDuration = 15; // Use 15 minutes as minimum slot duration
      
      let currentTime = new Date(startTime);
      
      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
        
        if (slotEnd > endTime) {
          break;
        }
        
        // Check if this slot conflicts with unavailabilities
        const isUnavailable = unavailabilities.some((unavail: any) => {
          const unavailStart = new Date(`1970-01-01T${unavail.startTime}:00`);
          const unavailEnd = new Date(`1970-01-01T${unavail.endTime}:00`);
          return !(slotEnd <= unavailStart || currentTime >= unavailEnd);
        });

        // Check if this slot conflicts with existing appointments
        const hasAppointmentConflict = appointments.some(appointment => {
          const appointmentStart = new Date(`1970-01-01T${appointment.startTime}:00`);
          const appointmentEnd = new Date(`1970-01-01T${appointment.endTime}:00`);
          return !(slotEnd <= appointmentStart || currentTime >= appointmentEnd);
        });

        if (!isUnavailable && !hasAppointmentConflict) {
          slots.push(currentTime.toTimeString().slice(0, 5));
        }

        currentTime.setMinutes(currentTime.getMinutes() + 15);
      }
      
      hasAvailableSlots = slots.length > 0;
    }

    res.json({
      isWorkingDay,
      hasUnavailability,
      isCompletelyBlocked,
      hasAvailableSlots,
      unavailabilities: unavailabilities.map(u => ({
        startTime: u.startTime,
        endTime: u.endTime,
        reason: u.reason
      }))
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao verificar data',
      error: error.message 
    });
  }
});

export default router;
