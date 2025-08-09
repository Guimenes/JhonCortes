import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, ArrowLeft, ArrowRight, Scissors, CalendarCheck, MessageSquare } from 'lucide-react';
import type { Service, CreateAppointmentData, Schedule } from '../../types';
import { servicesAPI, appointmentsAPI, schedulesAPI } from '../../services/api';
import { showSuccess, showError, showWarning, showConfirmation } from '../../utils/alerts';
import CustomCalendar from '../CustomCalendar';
import './styles.css';

interface BookingWizardProps {
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

interface BookingData {
  service?: Service;
  date?: string;
  time?: string;
  notes?: string;
}

const BookingWizard: React.FC<BookingWizardProps> = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({});

  const steps = [
    { number: 1, title: 'Escolha o Serviço', icon: Scissors },
    { number: 2, title: 'Selecione a Data', icon: Calendar },
    { number: 3, title: 'Escolha o Horário', icon: Clock },
    { number: 4, title: 'Informações Extras', icon: MessageSquare },
    { number: 5, title: 'Confirmação', icon: CalendarCheck }
  ];

  useEffect(() => {
    loadServices();
    loadSchedules();
  }, []);

  useEffect(() => {
    if (bookingData.date && bookingData.service) {
      loadAvailableSlots();
    }
  }, [bookingData.date, bookingData.service]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await servicesAPI.getAll();
      setServices(data.filter(service => service.isActive));
    } catch (error) {
      showError('Erro', 'Não foi possível carregar os serviços.');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const data = await schedulesAPI.getAll();
      setSchedules(data);
    } catch (error) {
      console.error('Erro ao carregar horários de funcionamento:', error);
    }
  };

  const loadAvailableSlots = async () => {
    if (!bookingData.date || !bookingData.service) return;
    
    try {
      setLoading(true);
      const data = await appointmentsAPI.getAvailableSlots(bookingData.date, bookingData.service._id);
      setAvailableSlots(data.availableSlots);
    } catch (error) {
      showError('Erro', 'Não foi possível carregar os horários disponíveis.');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setBookingData({ ...bookingData, service });
    setCurrentStep(2);
  };

  const handleDateSelect = (date: string) => {
    setBookingData({ ...bookingData, date, time: undefined });
    setCurrentStep(3);
  };

  const handleTimeSelect = (time: string) => {
    setBookingData({ ...bookingData, time });
    setCurrentStep(4);
  };

  const handleNotesChange = (notes: string) => {
    setBookingData({ ...bookingData, notes });
  };

  const handleConfirmBooking = async () => {
    if (!bookingData.service || !bookingData.date || !bookingData.time) {
      showError('Erro', 'Dados incompletos para o agendamento.');
      return;
    }

    try {
      setLoading(true);
      const appointmentData: CreateAppointmentData = {
        serviceId: bookingData.service._id,
        date: bookingData.date,
        startTime: bookingData.time,
        notes: bookingData.notes
      };

      await appointmentsAPI.create(appointmentData);
      showSuccess('Sucesso!', 'Agendamento realizado com sucesso!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      showError('Erro', error.response?.data?.message || 'Não foi possível realizar o agendamento.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2); // 2 meses à frente
    return maxDate.toISOString().split('T')[0];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return !!bookingData.service;
      case 2: return !!bookingData.date;
      case 3: return !!bookingData.time;
      case 4: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Escolha o Serviço</h3>
              <p>Selecione o serviço que você deseja agendar</p>
            </div>
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Carregando serviços...</p>
              </div>
            ) : (
              <div className="services-grid">
                {services.map(service => (
                  <div
                    key={service._id}
                    className={`service-card ${bookingData.service?._id === service._id ? 'selected' : ''}`}
                    onClick={() => handleServiceSelect(service)}
                  >
                    {service.image && (
                      <div className="service-image">
                        <img src={service.image} alt={service.name} />
                      </div>
                    )}
                    <div className="service-info">
                      <h4>{service.name}</h4>
                      <p className="service-description">{service.description}</p>
                      <div className="service-details">
                        <span className="duration">
                          <Clock size={16} />
                          {service.duration} min
                        </span>
                        <span className="price">{formatPrice(service.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const workingDays = schedules.filter(s => s.isActive).map(s => s.dayOfWeek);
        
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Selecione a Data</h3>
              <p>Escolha o dia para o seu agendamento</p>
            </div>
            
            {schedules.length > 0 && (
              <div className="working-days-info">
                <h4>Dias de Funcionamento:</h4>
                <div className="days-badges">
                  {daysOfWeek.map((day, index) => (
                    <span 
                      key={index}
                      className={`day-badge ${workingDays.includes(index as 0 | 1 | 2 | 3 | 4 | 5 | 6) ? 'working' : 'closed'}`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <CustomCalendar
              selectedDate={bookingData.date}
              onDateSelect={handleDateSelect}
              minDate={getMinDate()}
              maxDate={getMaxDate()}
            />

            {bookingData.date && (
              <div className="selected-date-info">
                <Calendar size={20} />
                <span>Data selecionada: {formatDate(bookingData.date)}</span>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Escolha o Horário</h3>
              <p>Selecione um horário disponível para {formatDate(bookingData.date!)}</p>
            </div>

            {bookingData.service && (
              <div className="selected-service-info">
                <h4>Serviço selecionado:</h4>
                <div className="service-details">
                  <span className="service-name">{bookingData.service.name}</span>
                  <span className="service-duration">
                    <Clock size={16} />
                    {bookingData.service.duration} minutos
                  </span>
                  <span className="service-price">
                    {formatPrice(bookingData.service.price)}
                  </span>
                </div>
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Carregando horários disponíveis...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              <>
                <div className="time-slots-grid">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      className={`time-slot ${bookingData.time === slot ? 'selected' : ''}`}
                      onClick={() => handleTimeSelect(slot)}
                    >
                      <Clock size={16} />
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>
                
                <div className="time-info">
                  <div className="info-item">
                    <Clock size={16} />
                    <span>Duração: {bookingData.service?.duration || 30} minutos</span>
                  </div>
                  <div className="info-item">
                    <span className="price-highlight">
                      Preço: {formatPrice(bookingData.service?.price || 0)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <Clock size={48} />
                <h4>Nenhum horário disponível</h4>
                <p>Não há horários disponíveis para esta data. Isso pode ser devido a:</p>
                <ul className="reasons-list">
                  <li>Todos os horários já estão agendados</li>
                  <li>Há indisponibilidades cadastradas para este dia</li>
                  <li>O horário de funcionamento está limitado</li>
                </ul>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setCurrentStep(2)}
                >
                  Escolher Outra Data
                </button>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Informações Extras</h3>
              <p>Adicione observações para o seu agendamento (opcional)</p>
            </div>
            <div className="notes-container">
              <textarea
                value={bookingData.notes || ''}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Alguma observação especial? (Ex: preferência de estilo, alergias, etc.)"
                className="notes-input"
                maxLength={500}
                rows={4}
              />
              <span className="char-count">
                {(bookingData.notes || '').length}/500
              </span>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>Confirmação do Agendamento</h3>
              <p>Revise os dados do seu agendamento</p>
            </div>
            <div className="confirmation-details">
              <div className="detail-group">
                <h4>Serviço</h4>
                <div className="detail-card">
                  <div className="detail-info">
                    <strong>{bookingData.service?.name}</strong>
                    <p>{bookingData.service?.description}</p>
                    <div className="detail-meta">
                      <span>
                        <Clock size={16} />
                        {bookingData.service?.duration} minutos
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-group">
                <h4>Data e Horário</h4>
                <div className="detail-card">
                  <div className="detail-info">
                    <div className="datetime-info">
                      <Calendar size={20} />
                      <div>
                        <strong>{formatDate(bookingData.date!)}</strong>
                        <p>às {formatTime(bookingData.time!)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {bookingData.notes && (
                <div className="detail-group">
                  <h4>Observações</h4>
                  <div className="detail-card">
                    <p>{bookingData.notes}</p>
                  </div>
                </div>
              )}

              <div className="total-section">
                <div className="total-line">
                  <span>Total:</span>
                  <strong>{formatPrice(bookingData.service?.price || 0)}</strong>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Função para validar se é possível cancelar o agendamento (regra: até 2 horas antes)
  const handleCloseOrCancel = () => {
    if (currentStep === 1) {
      // Se estiver no primeiro passo, pode fechar diretamente
      onClose();
    } else if (currentStep === 5 && bookingData.date && bookingData.time) {
      // Se estiver no último passo (confirmação) e já tem data e hora selecionadas
      // Combinar data e hora do agendamento
      const appointmentDateTime = new Date(`${bookingData.date}T${bookingData.time}`);
      const now = new Date();
      
      // Calcular a diferença em horas
      const diffHours = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < 2) {
        // Se for menos de 2 horas antes, mostrar alerta e não permitir cancelamento
        showWarning(
          'Cancelamento não permitido',
          'Não é possível cancelar agendamentos com menos de 2 horas de antecedência. Você pode remarcar este horário diretamente na barbearia.',
          true
        );
      } else {
        // Confirmar antes de cancelar
        showConfirmation(
          'Cancelar agendamento?',
          'Você está prestes a cancelar seu agendamento. Tem certeza que deseja continuar?',
          'Sim, cancelar',
          'Não, manter agendamento'
        ).then((result: any) => {
          if (result.isConfirmed) {
            onClose();
            showSuccess('Agendamento cancelado com sucesso!');
          }
        });
      }
    } else {
      // Se estiver em passos intermediários, apenas voltar ao passo anterior
      setCurrentStep((currentStep - 1) as Step);
    }
  };
  
  return (
    <div className="booking-wizard-overlay">
      <div className="booking-wizard">
        <div className="wizard-header">
          <h2><Scissors size={22} /> Agendar Horário</h2>
          <button className="close-btn" onClick={() => {
            // Se estiver no primeiro passo ou não tiver data/hora selecionada, pode fechar diretamente
            if (currentStep === 1 || !bookingData.date || !bookingData.time) {
              onClose();
            } else {
              handleCloseOrCancel();
            }
          }}>×</button>
        </div>

        <div className="progress-steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <div 
                key={step.number}
                className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="step-indicator">
                  <Icon size={window.innerWidth <= 480 ? 16 : 20} />
                </div>
                <div className="step-info">
                  <span className="step-number">Passo {step.number}</span>
                  <span className="step-title">{step.title}</span>
                </div>
                {index < steps.length - 1 && <div className="step-connector" />}
              </div>
            );
          })}
        </div>

        <div className="wizard-content">
          {renderStepContent()}
        </div>

        <div className="wizard-footer">
          <button
            className="btn btn-secondary"
            onClick={handleCloseOrCancel}
          >
            <ArrowLeft size={16} />
            {currentStep > 1 ? 'Voltar' : 'Cancelar'}
          </button>

          {currentStep < 5 ? (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentStep((currentStep + 1) as Step)}
              disabled={!canGoNext()}
            >
              Próximo
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleConfirmBooking}
              disabled={loading}
            >
              {loading ? 'Confirmando...' : 'Confirmar'}
              <CheckCircle size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;
