import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loading } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useDashboard, useAppointments } from '../hooks';
import { formatCurrency, formatDate, theme } from '../utils';

const { width } = Dimensions.get('window');
const cardWidth = (width - theme.spacing.lg * 3) / 2;

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { stats, loading, fetchStats } = useDashboard();
  const { appointments, fetchTodayAppointments } = useAppointments();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await Promise.all([
      fetchStats(),
      fetchTodayAppointments(),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return <Loading text="Carregando dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Olá, {user?.name?.split(' ')[0] || 'Admin'}!
          </Text>
          <Text style={styles.date}>{formatDate(new Date())}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.row}>
            <Card style={[styles.statCard, { width: cardWidth }]}>
              <View style={styles.statContent}>
                <Ionicons
                  name="calendar"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.statValue}>
                  {stats?.todayAppointments || 0}
                </Text>
                <Text style={styles.statLabel}>Hoje</Text>
              </View>
            </Card>

            <Card style={[styles.statCard, { width: cardWidth }]}>
              <View style={styles.statContent}>
                <Ionicons
                  name="cash"
                  size={24}
                  color={theme.colors.success}
                />
                <Text style={styles.statValue}>
                  {formatCurrency(stats?.todayRevenue || 0)}
                </Text>
                <Text style={styles.statLabel}>Receita Hoje</Text>
              </View>
            </Card>
          </View>

          <View style={styles.row}>
            <Card style={[styles.statCard, { width: cardWidth }]}>
              <View style={styles.statContent}>
                <Ionicons
                  name="people"
                  size={24}
                  color={theme.colors.info}
                />
                <Text style={styles.statValue}>
                  {stats?.totalClients || 0}
                </Text>
                <Text style={styles.statLabel}>Clientes</Text>
              </View>
            </Card>

            <Card style={[styles.statCard, { width: cardWidth }]}>
              <View style={styles.statContent}>
                <Ionicons
                  name="cut"
                  size={24}
                  color={theme.colors.warning}
                />
                <Text style={styles.statValue}>
                  {stats?.totalServices || 0}
                </Text>
                <Text style={styles.statLabel}>Serviços</Text>
              </View>
            </Card>
          </View>
        </View>

        <Card style={styles.appointmentsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Agendamentos de Hoje</Text>
            <Text style={styles.appointmentCount}>
              {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {appointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={theme.colors.text.disabled}
              />
              <Text style={styles.emptyText}>
                Nenhum agendamento para hoje
              </Text>
            </View>
          ) : (
            appointments.slice(0, 5).map((appointment) => (
              <View key={appointment._id} style={styles.appointmentItem}>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.clientName}>
                    {appointment.user.name}
                  </Text>
                  <Text style={styles.serviceName}>
                    {appointment.service.name}
                  </Text>
                </View>
                <View style={styles.appointmentDetails}>
                  <Text style={styles.appointmentTime}>
                    {appointment.startTime}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    appointment.status === 'pendente' && styles.status_pendente,
                    appointment.status === 'confirmado' && styles.status_confirmado,
                    appointment.status === 'concluido' && styles.status_concluido,
                    appointment.status === 'cancelado' && styles.status_cancelado,
                  ]}>
                    <Text style={styles.statusText}>
                      {appointment.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  date: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  statsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  statCard: {
    padding: theme.spacing.md,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginVertical: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  appointmentsCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  appointmentCount: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.disabled,
    marginTop: theme.spacing.sm,
  },
  appointmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  appointmentInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  serviceName: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  appointmentDetails: {
    alignItems: 'flex-end',
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  status_pendente: {
    backgroundColor: theme.colors.warning + '20',
  },
  status_confirmado: {
    backgroundColor: theme.colors.info + '20',
  },
  status_concluido: {
    backgroundColor: theme.colors.success + '20',
  },
  status_cancelado: {
    backgroundColor: theme.colors.error + '20',
  },
});

export default DashboardScreen;
