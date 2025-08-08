import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { appointmentsAPI, schedulesAPI } from '../../services/api';
import type { Schedule } from '../../types';
import './styles.css';

interface DateStatus {
  isWorkingDay: boolean;
  hasUnavailability: boolean;
  isCompletelyBlocked: boolean;
  unavailabilities: Array<{
    startTime: string;
    endTime: string;
    reason: string;
  }>;
}

interface CustomCalendarProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [dateStatuses, setDateStatuses] = useState<{ [key: string]: DateStatus }>({});
  const [loading, setLoading] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Zerar horário para comparar apenas datas
  const minDateTime = minDate ? new Date(minDate) : today;
  const maxDateTime = maxDate ? new Date(maxDate) : new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days

  useEffect(() => {
    loadSchedules();
  }, []);

  useEffect(() => {
    loadDateStatuses();
  }, [currentDate, schedules]);

  const loadSchedules = async () => {
    try {
      const data = await schedulesAPI.getAll();
      setSchedules(data);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    }
  };

  const loadDateStatuses = async () => {
    if (schedules.length === 0) return;

    setLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const statusPromises = [];
    const newStatuses: { [key: string]: DateStatus } = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Skip dates outside the allowed range
      if (date < minDateTime || date > maxDateTime) {
        continue;
      }

      statusPromises.push(
        appointmentsAPI.checkDate(dateString)
          .then(status => {
            newStatuses[dateString] = status;
          })
          .catch(error => {
            console.error(`Erro ao verificar data ${dateString}:`, error);
            newStatuses[dateString] = {
              isWorkingDay: false,
              hasUnavailability: false,
              isCompletelyBlocked: false,
              unavailabilities: []
            };
          })
      );
    }

    try {
      await Promise.all(statusPromises);
      setDateStatuses(prev => ({ ...prev, ...newStatuses }));
    } catch (error) {
      console.error('Erro ao carregar status das datas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateClass = (date: Date): string => {
    const dateString = date.toISOString().split('T')[0];
    const status = dateStatuses[dateString];
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = selectedDate === dateString;
    const isPast = date < today;
    const isOutOfRange = date < minDateTime || date > maxDateTime;

    let classes = 'calendar-day';

    if (isSelected) classes += ' selected';
    if (isToday) classes += ' today';
    if (isPast || isOutOfRange) classes += ' disabled';
    
    if (status) {
      if (!status.isWorkingDay) {
        classes += ' not-working';
      } else if (status.isCompletelyBlocked) {
        classes += ' completely-blocked';
      } else if (status.hasUnavailability) {
        classes += ' partially-unavailable';
      } else {
        classes += ' available';
      }
    }

    return classes;
  };

  const getDateTitle = (date: Date): string => {
    const dateString = date.toISOString().split('T')[0];
    const status = dateStatuses[dateString];
    
    if (!status) return '';
    
    if (!status.isWorkingDay) {
      return 'Barbearia fechada neste dia';
    }
    
    if (status.isCompletelyBlocked) {
      return 'Dia completamente indisponível';
    }
    
    if (status.hasUnavailability) {
      const reasons = status.unavailabilities.map(u => u.reason).join(', ');
      return `Indisponibilidades: ${reasons}`;
    }
    
    return 'Dia disponível para agendamento';
  };

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const status = dateStatuses[dateString];
    const isPast = date < today;
    const isOutOfRange = date < minDateTime || date > maxDateTime;
    
    if (isPast || isOutOfRange || !status?.isWorkingDay || status?.isCompletelyBlocked) {
      return;
    }
    
    onDateSelect(dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateClass = getDateClass(date);
      const dateTitle = getDateTitle(date);
      
      days.push(
        <button
          key={day}
          className={dateClass}
          title={dateTitle}
          onClick={() => handleDateClick(date)}
          disabled={dateClass.includes('disabled') || dateClass.includes('not-working') || dateClass.includes('completely-blocked')}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="custom-calendar">
      <div className="calendar-header">
        <button
          className="nav-button"
          onClick={() => navigateMonth('prev')}
          disabled={loading}
        >
          <ChevronLeft size={20} />
        </button>
        
        <h3 className="calendar-title">
          <CalendarIcon size={20} />
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <button
          className="nav-button"
          onClick={() => navigateMonth('next')}
          disabled={loading}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>
        
        <div className="calendar-days">
          {loading ? (
            <div className="calendar-loading">
              <div className="spinner"></div>
              <p>Carregando disponibilidade...</p>
            </div>
          ) : (
            renderCalendar()
          )}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Disponível</span>
        </div>
        <div className="legend-item">
          <div className="legend-color partially-unavailable"></div>
          <span>Parcialmente indisponível</span>
        </div>
        <div className="legend-item">
          <div className="legend-color completely-blocked"></div>
          <span>Totalmente bloqueado</span>
        </div>
        <div className="legend-item">
          <div className="legend-color not-working"></div>
          <span>Fechado</span>
        </div>
      </div>
    </div>
  );
};

export default CustomCalendar;
