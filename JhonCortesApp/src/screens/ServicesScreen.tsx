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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loading, Button, Input } from '../components/ui';
import { useServices } from '../hooks';
import { formatCurrency, formatDuration, theme } from '../utils';
import type { Service, CreateServiceData } from '../types';

export const ServicesScreen: React.FC = () => {
  const {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    toggleServiceActive,
    fetchServices
  } = useServices();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<CreateServiceData>({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category: 'corte',
  });

  const loadServices = async () => {
    await fetchServices();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const handleCreateService = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      duration: 30,
      price: 0,
      category: 'corte',
    });
    setModalVisible(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
    });
    setModalVisible(true);
  };

  const handleSaveService = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome do serviço é obrigatório');
      return;
    }

    if (formData.price <= 0) {
      Alert.alert('Erro', 'Preço deve ser maior que zero');
      return;
    }

    if (formData.duration <= 0) {
      Alert.alert('Erro', 'Duração deve ser maior que zero');
      return;
    }

    try {
      if (editingService) {
        await updateService(editingService._id, formData);
        Alert.alert('Sucesso', 'Serviço atualizado com sucesso!');
      } else {
        await createService(formData);
        Alert.alert('Sucesso', 'Serviço criado com sucesso!');
      }
      
      setModalVisible(false);
      await loadServices();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      Alert.alert('Erro', 'Não foi possível salvar o serviço');
    }
  };

  const handleDeleteService = (service: Service) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja excluir o serviço "${service.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteService(service._id);
              Alert.alert('Sucesso', 'Serviço excluído com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir serviço:', error);
              Alert.alert('Erro', 'Não foi possível excluir o serviço');
            }
          }
        },
      ]
    );
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      await toggleServiceActive(service._id);
      
      Alert.alert(
        'Sucesso', 
        `Serviço ${service.isActive ? 'desativado' : 'ativado'} com sucesso!`
      );
    } catch (error) {
      console.error('Erro ao alterar status do serviço:', error);
      Alert.alert('Erro', 'Não foi possível alterar o status do serviço');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'corte': return 'cut';
      case 'barba': return 'man';
      case 'combo': return 'star';
      case 'outros': return 'ellipsis-horizontal';
      default: return 'help-circle';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'corte': return 'Corte';
      case 'barba': return 'Barba';
      case 'combo': return 'Combo';
      case 'outros': return 'Outros';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'corte': return theme.colors.primary;
      case 'barba': return theme.colors.secondary;
      case 'combo': return theme.colors.success;
      case 'outros': return theme.colors.info;
      default: return theme.colors.text.secondary;
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Serviços</Text>
            <Text style={styles.subtitle}>
              {services.filter(s => s.isActive).length} serviço(s) ativo(s)
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreateService}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {services.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Ionicons 
                name="cut-outline" 
                size={64} 
                color={theme.colors.text.secondary} 
              />
              <Text style={styles.emptyTitle}>Nenhum serviço encontrado</Text>
              <Text style={styles.emptySubtitle}>
                Crie seu primeiro serviço para começar
              </Text>
              <Button
                title="Criar Serviço"
                onPress={handleCreateService}
                style={styles.emptyButton}
              />
            </View>
          </Card>
        ) : (
          services.map((service) => (
            <Card key={service._id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                  <View style={styles.serviceNameRow}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: service.isActive ? theme.colors.success : theme.colors.error }
                    ]} />
                  </View>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </View>
                <View style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(service.category) }
                ]}>
                  <Ionicons 
                    name={getCategoryIcon(service.category)} 
                    size={16} 
                    color="white" 
                  />
                  <Text style={styles.categoryText}>
                    {getCategoryName(service.category)}
                  </Text>
                </View>
              </View>

              <View style={styles.serviceDetails}>
                <View style={styles.detailItem}>
                  <Ionicons 
                    name="time-outline" 
                    size={16} 
                    color={theme.colors.text.secondary} 
                  />
                  <Text style={styles.detailText}>
                    {formatDuration(service.duration)}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Ionicons 
                    name="cash-outline" 
                    size={16} 
                    color={theme.colors.text.secondary} 
                  />
                  <Text style={styles.detailText}>
                    {formatCurrency(service.price)}
                  </Text>
                </View>
              </View>

              <View style={styles.serviceActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditService(service)}
                >
                  <Ionicons name="pencil" size={16} color={theme.colors.primary} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                    Editar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.toggleButton]}
                  onPress={() => toggleServiceStatus(service)}
                >
                  <Ionicons 
                    name={service.isActive ? "eye-off" : "eye"} 
                    size={16} 
                    color={service.isActive ? theme.colors.warning : theme.colors.success} 
                  />
                  <Text style={[
                    styles.actionButtonText, 
                    { color: service.isActive ? theme.colors.warning : theme.colors.success }
                  ]}>
                    {service.isActive ? 'Desativar' : 'Ativar'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteService(service)}
                >
                  <Ionicons name="trash" size={16} color={theme.colors.error} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
                    Excluir
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Modal de Criar/Editar Serviço */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </Text>
            <View style={styles.modalCloseButton} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Input
              label="Nome do Serviço"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ex: Corte Masculino"
            />

            <Input
              label="Descrição"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Descreva o serviço..."
              multiline
              numberOfLines={3}
            />

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Input
                  label="Duração (minutos)"
                  value={formData.duration.toString()}
                  onChangeText={(text) => setFormData({ 
                    ...formData, 
                    duration: parseInt(text) || 0 
                  })}
                  placeholder="30"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formColumn}>
                <Input
                  label="Preço (R$)"
                  value={formData.price.toString()}
                  onChangeText={(text) => setFormData({ 
                    ...formData, 
                    price: parseFloat(text) || 0 
                  })}
                  placeholder="25.00"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.categoryLabel}>Categoria</Text>
            <View style={styles.categoryContainer}>
              {[
                { key: 'corte', label: 'Corte', icon: 'cut' },
                { key: 'barba', label: 'Barba', icon: 'man' },
                { key: 'combo', label: 'Combo', icon: 'star' },
                { key: 'outros', label: 'Outros', icon: 'ellipsis-horizontal' },
              ].map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryOption,
                    formData.category === category.key && styles.categoryOptionActive
                  ]}
                  onPress={() => setFormData({ 
                    ...formData, 
                    category: category.key as any 
                  })}
                >
                  <Ionicons 
                    name={category.icon as any} 
                    size={20} 
                    color={
                      formData.category === category.key 
                        ? 'white' 
                        : theme.colors.text.secondary
                    } 
                  />
                  <Text style={[
                    styles.categoryOptionText,
                    formData.category === category.key && styles.categoryOptionTextActive
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={() => setModalVisible(false)}
              style={styles.modalActionButton}
            />
            <Button
              title={editingService ? 'Atualizar' : 'Criar'}
              onPress={handleSaveService}
              style={styles.modalActionButton}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 150,
  },
  serviceCard: {
    marginBottom: 16,
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  editButton: {
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
  toggleButton: {
    borderColor: theme.colors.warning,
    backgroundColor: 'transparent',
  },
  deleteButton: {
    borderColor: theme.colors.error,
    backgroundColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formColumn: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
    marginTop: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
    gap: 8,
    minWidth: '47%',
  },
  categoryOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  categoryOptionTextActive: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalActionButton: {
    flex: 1,
  },
});
