import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';
import BadgeDisplay from './components/BadgeDisplay';

interface ProfileScreenProps {
  currentMode: 'talk' | 'listen' | null;
  onModeChange: (mode: 'talk' | 'listen') => void;
  onBack: () => void;
}

export default function ProfileScreen({ currentMode, onModeChange, onBack }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleModeChange = (newMode: 'talk' | 'listen') => {
    if (newMode === currentMode) return;

    Alert.alert(
      'Mudar modo',
      `Tens a certeza que queres mudar para o modo "${newMode === 'talk' ? 'Preciso de falar' : 'Quero ouvir'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sim, mudar', 
          onPress: () => onModeChange(newMode),
          style: 'default'
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sair da conta',
      'Tens a certeza que queres sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          onPress: signOut,
          style: 'destructive'
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.name || 'Utilizador'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'email@exemplo.com'}</Text>
          </View>

          {/* Current Mode Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Modo Atual</Text>
            <View style={styles.currentModeCard}>
              <View style={styles.modeIconContainer}>
                <Text style={styles.modeIcon}>
                  {currentMode === 'talk' ? '💬' : '👂'}
                </Text>
              </View>
              <View style={styles.modeInfo}>
                <Text style={styles.modeTitle}>
                  {currentMode === 'talk' ? 'Preciso de falar' : 'Quero ouvir'}
                </Text>
                <Text style={styles.modeDescription}>
                  {currentMode === 'talk' 
                    ? 'Estás no modo de partilhar e expressar os teus sentimentos'
                    : 'Estás no modo de acolher e ouvir outras pessoas'
                  }
                </Text>
              </View>
            </View>
            
            {/* Badge Display for Listen Mode */}
            {currentMode === 'listen' && user?.id && (
              <View style={styles.badgeSection}>
                <Text style={styles.badgeSectionTitle}>🏆 Teu Badge de Listener</Text>
                <BadgeDisplay 
                  userId={user.id} 
                  userMode="listen"
                  style={styles.profileBadge}
                />
              </View>
            )}
          </View>

          {/* Change Mode Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mudar Modo</Text>
            <Text style={styles.sectionSubtitle}>
              Podes mudar o teu modo a qualquer momento
            </Text>
            
            <View style={styles.modeOptions}>
              {/* Talk Mode Option */}
              <TouchableOpacity
                style={[
                  styles.modeOption,
                  styles.talkOption,
                  currentMode === 'talk' && styles.currentModeOption,
                ]}
                onPress={() => handleModeChange('talk')}
                disabled={currentMode === 'talk'}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionIcon}>💬</Text>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Preciso de falar</Text>
                    <Text style={styles.optionDescription}>
                      Quero partilhar o que sinto
                    </Text>
                  </View>
                  {currentMode === 'talk' && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Atual</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Listen Mode Option */}
              <TouchableOpacity
                style={[
                  styles.modeOption,
                  styles.listenOption,
                  currentMode === 'listen' && styles.currentModeOption,
                ]}
                onPress={() => handleModeChange('listen')}
                disabled={currentMode === 'listen'}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionIcon}>👂</Text>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Quero ouvir</Text>
                    <Text style={styles.optionDescription}>
                      Quero acolher e apoiar
                    </Text>
                  </View>
                  {currentMode === 'listen' && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Atual</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre a App</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Fala é um espaço seguro onde podes partilhar os teus sentimentos ou oferecer apoio a quem precisa.
              </Text>
              <Text style={styles.infoText}>
                Ambos os modos são igualmente importantes e valiosos.
              </Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BDE0FE', // Sky Blue - Pureza, calma
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ecf0',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#6b5bff',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  signOutButton: {
    padding: 8,
  },
  signOutText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6b5bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A4A4A', // Dark Gray - Estabilidade
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#8A8A8A', // Light Gray - Acolhimento
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A4A4A', // Dark Gray - Estabilidade
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8A8A8A', // Light Gray - Acolhimento
    marginBottom: 16,
  },
  currentModeCard: {
    backgroundColor: 'rgba(255,255,255,0.9)', // Branco translúcido
    borderRadius: 20, // Cantos muito arredondados
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.05)', // Sombra suave
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  modeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(205,180,219,0.1)', // Lavender Dream com transparência
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modeIcon: {
    fontSize: 24,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A4A', // Dark Gray - Estabilidade
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: '#8A8A8A', // Light Gray - Acolhimento
    lineHeight: 20,
  },
  modeOptions: {
    gap: 12,
  },
  modeOption: {
    backgroundColor: 'rgba(255,255,255,0.9)', // Branco translúcido
    borderRadius: 20, // Cantos muito arredondados
    padding: 16,
    shadowColor: 'rgba(0,0,0,0.05)', // Sombra suave
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  currentModeOption: {
    borderWidth: 2,
    borderColor: '#CDB4DB', // Lavender Dream
  },
  talkOption: {
    borderLeftWidth: 4,
    borderLeftColor: '#CDB4DB', // Lavender Dream
  },
  listenOption: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFC8DD', // Blush Pink
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A4A', // Dark Gray - Estabilidade
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#8A8A8A', // Light Gray - Acolhimento
  },
  currentBadge: {
    backgroundColor: '#CDB4DB', // Lavender Dream
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.9)', // Branco translúcido
    borderRadius: 20, // Cantos muito arredondados
    padding: 20,
    shadowColor: 'rgba(0,0,0,0.05)', // Sombra suave
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#8A8A8A', // Light Gray - Acolhimento
    lineHeight: 22,
    marginBottom: 8,
  },
  badgeSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  badgeSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A4A', // Dark Gray - Estabilidade
    marginBottom: 12,
  },
  profileBadge: {
    // Custom styles for badge in profile
  },
});

