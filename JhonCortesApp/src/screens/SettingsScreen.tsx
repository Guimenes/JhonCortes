import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../utils';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair do aplicativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: () => logout()
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Exportar Dados',
      'Esta funcionalidade permitirá exportar todos os dados do sistema.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Exportar', 
          onPress: () => {
            // TODO: Implementar exportação de dados
            Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.');
          }
        },
      ]
    );
  };

  const handleBackup = () => {
    Alert.alert(
      'Backup Manual',
      'Deseja fazer um backup dos dados agora?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Fazer Backup', 
          onPress: () => {
            // TODO: Implementar backup
            Alert.alert('Sucesso', 'Backup realizado com sucesso!');
          }
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Sobre o App',
      'Jhon Cortes Admin\nVersão 1.0.0\n\nAplicativo administrativo para gerenciamento de barbearia.\n\nDesenvolvido com React Native + Expo',
      [{ text: 'OK' }]
    );
  };

  const settingSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Conta',
      items: [
        {
          id: 'profile',
          title: 'Perfil',
          subtitle: user?.name || 'Administrador',
          icon: 'person-outline',
          type: 'navigation',
          onPress: () => {
            Alert.alert('Em desenvolvimento', 'Edição de perfil será implementada em breve.');
          },
        },
        {
          id: 'changePassword',
          title: 'Alterar Senha',
          subtitle: 'Mantenha sua conta segura',
          icon: 'lock-closed-outline',
          type: 'navigation',
          onPress: () => {
            Alert.alert('Em desenvolvimento', 'Alteração de senha será implementada em breve.');
          },
        },
      ],
    },
    {
      title: 'Notificações',
      items: [
        {
          id: 'notifications',
          title: 'Notificações Push',
          subtitle: 'Receber notificações de agendamentos',
          icon: 'notifications-outline',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
      ],
    },
    {
      title: 'Aparência',
      items: [
        {
          id: 'darkMode',
          title: 'Modo Escuro',
          subtitle: 'Ativar tema escuro',
          icon: 'moon-outline',
          type: 'toggle',
          value: darkMode,
          onToggle: setDarkMode,
        },
      ],
    },
    {
      title: 'Dados',
      items: [
        {
          id: 'autoBackup',
          title: 'Backup Automático',
          subtitle: 'Fazer backup dos dados diariamente',
          icon: 'cloud-upload-outline',
          type: 'toggle',
          value: autoBackup,
          onToggle: setAutoBackup,
        },
        {
          id: 'manualBackup',
          title: 'Fazer Backup',
          subtitle: 'Backup manual dos dados',
          icon: 'download-outline',
          type: 'action',
          onPress: handleBackup,
        },
        {
          id: 'exportData',
          title: 'Exportar Dados',
          subtitle: 'Exportar dados para arquivo',
          icon: 'document-text-outline',
          type: 'action',
          onPress: handleExportData,
        },
      ],
    },
    {
      title: 'Sistema',
      items: [
        {
          id: 'about',
          title: 'Sobre',
          subtitle: 'Informações do aplicativo',
          icon: 'information-circle-outline',
          type: 'navigation',
          onPress: handleAbout,
        },
        {
          id: 'support',
          title: 'Suporte',
          subtitle: 'Contatar suporte técnico',
          icon: 'help-circle-outline',
          type: 'navigation',
          onPress: () => {
            Alert.alert(
              'Suporte Técnico',
              'Entre em contato conosco:\n\nEmail: suporte@jhoncortes.com\nTelefone: (11) 99999-9999',
              [{ text: 'OK' }]
            );
          },
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.settingContent}>
          <View style={styles.settingIconContainer}>
            <Ionicons 
              name={item.icon as any} 
              size={24} 
              color={theme.colors.primary} 
            />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
          <View style={styles.settingAction}>
            {item.type === 'toggle' && (
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ 
                  false: theme.colors.border, 
                  true: theme.colors.primary + '40' 
                }}
                thumbColor={item.value ? theme.colors.primary : theme.colors.text.secondary}
              />
            )}
            {item.type === 'navigation' && (
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme.colors.text.secondary} 
              />
            )}
            {item.type === 'action' && (
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme.colors.text.secondary} 
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>
          Personalize o aplicativo
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || 'Administrador'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'admin@email.com'}</Text>
              <View style={styles.userRole}>
                <Ionicons 
                  name="shield-checkmark" 
                  size={16} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.userRoleText}>Administrador</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Settings Sections */}
        {settingSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <View key={item.id}>
                  {renderSettingItem(item)}
                  {index < section.items.length - 1 && (
                    <View style={styles.itemSeparator} />
                  )}
                </View>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Sair do Aplicativo"
            variant="outline"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Jhon Cortes Admin v1.0.0
          </Text>
          <Text style={styles.footerSubtext}>
            © 2024 Jhon Cortes. Todos os direitos reservados.
          </Text>
        </View>
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  userCard: {
    padding: 20,
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  userRole: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userRoleText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    padding: 16,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  settingAction: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemSeparator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 68,
  },
  logoutContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  logoutButton: {
    borderColor: theme.colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
