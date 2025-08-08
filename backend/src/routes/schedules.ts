import express from 'express';
import { Schedule, Unavailability } from '../models/Schedule';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// === ROTAS DE HORÁRIOS DE FUNCIONAMENTO ===

// Get all schedules
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await Schedule.find({ isActive: true }).sort({ dayOfWeek: 1, startTime: 1 });
    res.json(schedules);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar horários',
      error: error.message 
    });
  }
});

// Get all schedules (Admin only)
router.get('/schedules/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ dayOfWeek: 1, startTime: 1 });
    res.json(schedules);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar horários',
      error: error.message 
    });
  }
});

// Create new schedule (Admin only)
router.post('/schedules', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;

    // Verificar se já existe um horário para esse dia
    const existingSchedule = await Schedule.findOne({ dayOfWeek, isActive: true });
    if (existingSchedule) {
      return res.status(400).json({ 
        message: 'Já existe um horário cadastrado para este dia da semana' 
      });
    }

    const schedule = new Schedule({
      dayOfWeek,
      startTime,
      endTime
    });

    await schedule.save();

    res.status(201).json({
      message: 'Horário criado com sucesso',
      schedule
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: 'Erro ao criar horário',
      error: error.message 
    });
  }
});

// Update schedule (Admin only)
router.put('/schedules/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime, isActive } = req.body;

    // Se está alterando o dia da semana, verificar se já existe outro horário para esse dia
    if (dayOfWeek !== undefined) {
      const existingSchedule = await Schedule.findOne({ 
        dayOfWeek, 
        isActive: true, 
        _id: { $ne: id } 
      });
      if (existingSchedule) {
        return res.status(400).json({ 
          message: 'Já existe um horário cadastrado para este dia da semana' 
        });
      }
    }

    const schedule = await Schedule.findByIdAndUpdate(
      id,
      { dayOfWeek, startTime, endTime, isActive },
      { new: true, runValidators: true }
    );

    if (!schedule) {
      return res.status(404).json({ message: 'Horário não encontrado' });
    }

    res.json({
      message: 'Horário atualizado com sucesso',
      schedule
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: 'Erro ao atualizar horário',
      error: error.message 
    });
  }
});

// Delete schedule (Admin only) - Soft delete
router.delete('/schedules/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ message: 'Horário não encontrado' });
    }

    res.json({
      message: 'Horário desativado com sucesso',
      schedule
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: 'Erro ao desativar horário',
      error: error.message 
    });
  }
});

// === ROTAS DE INDISPONIBILIDADES ===

// Get all unavailabilities
router.get('/unavailabilities', async (req, res) => {
  try {
    const { date } = req.query;
    let query: any = { isActive: true };
    
    if (date) {
      const queryDate = new Date(date as string);
      query.date = {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59, 999))
      };
    } else {
      // Por padrão, buscar apenas indisponibilidades futuras
      query.date = { $gte: new Date() };
    }

    const unavailabilities = await Unavailability.find(query).sort({ date: 1, startTime: 1 });
    res.json(unavailabilities);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar indisponibilidades',
      error: error.message 
    });
  }
});

// Get all unavailabilities (Admin only)
router.get('/unavailabilities/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const unavailabilities = await Unavailability.find().sort({ date: 1, startTime: 1 });
    res.json(unavailabilities);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar indisponibilidades',
      error: error.message 
    });
  }
});

// Create new unavailability (Admin only)
router.post('/unavailabilities', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { date, startTime, endTime, reason } = req.body;

    const unavailability = new Unavailability({
      date,
      startTime,
      endTime,
      reason
    });

    await unavailability.save();

    res.status(201).json({
      message: 'Indisponibilidade criada com sucesso',
      unavailability
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: 'Erro ao criar indisponibilidade',
      error: error.message 
    });
  }
});

// Update unavailability (Admin only)
router.put('/unavailabilities/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, reason, isActive } = req.body;

    const unavailability = await Unavailability.findByIdAndUpdate(
      id,
      { date, startTime, endTime, reason, isActive },
      { new: true, runValidators: true }
    );

    if (!unavailability) {
      return res.status(404).json({ message: 'Indisponibilidade não encontrada' });
    }

    res.json({
      message: 'Indisponibilidade atualizada com sucesso',
      unavailability
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: 'Erro ao atualizar indisponibilidade',
      error: error.message 
    });
  }
});

// Delete unavailability (Admin only) - Soft delete
router.delete('/unavailabilities/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const unavailability = await Unavailability.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!unavailability) {
      return res.status(404).json({ message: 'Indisponibilidade não encontrada' });
    }

    res.json({
      message: 'Indisponibilidade removida com sucesso',
      unavailability
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: 'Erro ao remover indisponibilidade',
      error: error.message 
    });
  }
});

// Get available time slots for a specific date
router.get('/available-slots/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const queryDate = new Date(date);
    const dayOfWeek = queryDate.getDay();

    // Buscar horário de funcionamento para o dia da semana
    const schedule = await Schedule.findOne({ dayOfWeek, isActive: true });
    if (!schedule) {
      return res.json({ availableSlots: [] });
    }

    // Buscar indisponibilidades para a data específica
    const unavailabilities = await Unavailability.find({
      date: {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59, 999))
      },
      isActive: true
    });

    // Gerar slots disponíveis (a cada 30 minutos)
    const slots = [];
    const startTime = new Date(`1970-01-01T${schedule.startTime}:00`);
    const endTime = new Date(`1970-01-01T${schedule.endTime}:00`);
    
    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      
      // Verificar se o horário não está em uma indisponibilidade
      const isUnavailable = unavailabilities.some(unavail => {
        const unavailStart = new Date(`1970-01-01T${unavail.startTime}:00`);
        const unavailEnd = new Date(`1970-01-01T${unavail.endTime}:00`);
        return currentTime >= unavailStart && currentTime < unavailEnd;
      });

      if (!isUnavailable) {
        slots.push(timeString);
      }

      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    res.json({ availableSlots: slots });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar horários disponíveis',
      error: error.message 
    });
  }
});

export default router;
