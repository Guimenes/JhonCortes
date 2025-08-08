import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loading, Button } from '../components/ui';
import { useAppointments } from '../hooks';
import { formatDate, formatTime, theme } from '../utils';
import type { Appointment } from '../types';
import { appointmentsAPI } from '../services/appointments';

export const AppointmentsScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pendente' | 'confirmado' | 'concluido' | 'cancelado'>('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentsAPI.getAll();
      setAppointments(response);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const updateAppointmentStatus = async (appointmentId: string, status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido') => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, { status });
      await loadAppointments();
      Alert.alert('Sucesso', 'Status do agendamento atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status do agendamento');
    }
  };

  const confirmUpdateStatus = (appointment: Appointment, status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido') => {
    const statusText = {
      'confirmado': 'confirmar',
      'concluido': 'concluir',
      'cancelado': 'cancelar'
    }[status];

    Alert.alert(
      'Confirmar ação',
      `Deseja ${statusText} este agendamento?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => updateAppointmentStatus(appointment._id, status) 
        },
      ]
    );
  };

  const getFilteredAppointments = () => {
    if (filter === 'all') return appointments;
    return appointments.filter(apt => apt.status === filter);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pendente': return theme.colors.warning;
      case 'confirmado': return theme.colors.info;
      case 'concluido': return theme.colors.success;
      case 'cancelado': return theme.colors.error;
      default: return theme.colors.text.primary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'confirmado': return 'Confirmado';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return 'time-outline';
      case 'confirmado': return 'checkmark-circle-outline';
      case 'concluido': return 'checkmark-done-circle';
      case 'cancelado': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  if (loading) {
    return <Loading />;
  }

  const filteredAppointments = getFilteredAppointments();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agendamentos</Text>
        <Text style={styles.subtitle}>
          {filteredAppointments.length} agendamento(s) encontrado(s)
        </Text>
      </View>

      {/* Filtros */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {[
          { key: 'all', label: 'Todos', count: appointments.length },
          { key: 'pendente', label: 'Pendentes', count: appointments.filter(a => a.status === 'pendente').length },
          { key: 'confirmado', label: 'Confirmados', count: appointments.filter(a => a.status === 'confirmado').length },
          { key: 'concluido', label: 'Concluídos', count: appointments.filter(a => a.status === 'concluido').length },
          { key: 'cancelado', label: 'Cancelados', count: appointments.filter(a => a.status === 'cancelado').length },
        ].map((filterOption) => (
          <TouchableOpacity
            key={filterOption.key}
            style={[
              styles.filterChip,
              filter === filterOption.key && styles.filterChipActive
            ]}
            onPress={() => setFilter(filterOption.key as any)}
          >
            <Text style={[
              styles.filterChipText,
              filter === filterOption.key && styles.filterChipTextActive
            ]}>
              {filterOption.label} ({filterOption.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAppointments.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Ionicons 
                name="calendar-outline" 
                size={64} 
                color={theme.colors.text.secondary} 
              />
              <Text style={styles.emptyTitle}>Nenhum agendamento encontrado</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'all' 
                  ? 'Não há agendamentos cadastrados ainda'
                  : `Não há agendamentos com status "${getStatusText(filter)}"`
                }
              </Text>
            </View>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment._id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.clientName}>{appointment.user?.name}</Text>
                  <Text style={styles.serviceName}>{appointment.service?.name}</Text>
                </View>
                <View style={StyleSheet.flatten([
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(appointment.status) }
                ])}>
                  <Ionicons 
                    name={getStatusIcon(appointment.status)} 
                    size={16} 
                    color="white" 
                  />
                  <Text style={styles.statusText}>
                    {getStatusText(appointment.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.appointmentDetails}>
                <View style={styles.detailRow}>
                  <Ionicons 
                    name="calendar-outline" 
                    size={16} 
                    color={theme.colors.text.secondary} 
                  />
                  <Text style={styles.detailText}>
                    {formatDate(`${appointment.date}T${appointment.startTime}`)}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons 
                    name="time-outline" 
                    size={16} 
                    color={theme.colors.text.secondary} 
                  />
                  <Text style={styles.detailText}>
                    {appointment.startTime} - {appointment.endTime}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons 
                    name="cash-outline" 
                    size={16} 
                    color={theme.colors.text.secondary} 
                  />
                  <Text style={styles.detailText}>
                    R$ {appointment.service?.price?.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons 
                    name="call-outline" 
                    size={16} 
                    color={theme.colors.text.secondary} 
                  />
                  <Text style={styles.detailText}>
                    {appointment.user?.phone}
                  </Text>
                </View>
              </View>

              {appointment.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Observações:</Text>
                  <Text style={styles.notesText}>{appointment.notes}</Text>
                </View>
              )}

              {appointment.status === 'pendente' && (
                <View style={styles.actionsContainer}>
                  <Button
                    title="Confirmar"
                    variant="outline"
                    size="small"
                    onPress={() => confirmUpdateStatus(appointment, 'confirmado')}
                    style={styles.actionButton}
                  />
                  <Button
                    title="Cancelar"
                    variant="outline"
                    size="small"
                    onPress={() => confirmUpdateStatus(appointment, 'cancelado')}
                    style={StyleSheet.flatten([styles.actionButton, styles.cancelButton])}
                  />
                </View>
              )}

              {appointment.status === 'confirmado' && (
                <View style={styles.actionsContainer}>
                  <Button
                    title="Concluir"
                    variant="primary"
                    size="small"
                    onPress={() => confirmUpdateStatus(appointment, 'concluido')}
                    style={styles.actionButton}
                  />
                  <Button
                    title="Cancelar"
                    variant="outline"
                    size="small"
                    onPress={() => confirmUpdateStatus(appointment, 'cancelado')}
                    style={StyleSheet.flatten([styles.actionButton, styles.cancelButton])}
                  />
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  filtersContainer: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  appointmentCard: {
    marginBottom: 16,
    padding: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  appointmentInfo: {
    flex: 1,
    marginRight: 12,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  appointmentDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  notesContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  cancelButton: {
    borderColor: theme.colors.error,
  },
});
