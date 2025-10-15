import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';

interface BadgeStats {
  userId: string;
  totalConversationTime: number;
  totalMessages: number;
  totalRatings: number;
  averageRating: number;
  conversationsCount: number;
  currentBadge: string;
  currentBadgeEmoji: string;
  badgeLevel: number;
  nextBadge: {
    level: number;
    name: string;
    emoji: string;
    requirements: {
      time: number;
      messages: number;
      rating: number;
    };
  } | null;
}

interface BadgeDisplayProps {
  userId: string;
  userMode: 'talk' | 'listen';
  style?: any;
}

const { width } = Dimensions.get('window');
const API_URL = 'http://192.168.1.71:3000/api';

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ userId, userMode, style }) => {
  const [badgeStats, setBadgeStats] = useState<BadgeStats | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showNextBadgeModal, setShowNextBadgeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (userMode === 'listen' && userId) {
      fetchBadgeStats();
    }
  }, [userId, userMode]);

  useEffect(() => {
    if (badgeStats && badgeStats.badgeLevel > 1) {
      // Start pulse animation for higher level badges
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [badgeStats]);

  const fetchBadgeStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/user/${userId}/stats`);
      if (response.ok) {
        const stats = await response.json();
        setBadgeStats(stats);
      }
    } catch (error) {
      console.log('Error fetching badge stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const getProgressPercentage = (current: number, required: number) => {
    return Math.min((current / required) * 100, 100);
  };

  if (userMode !== 'listen' || !badgeStats) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.badgeContainer, style]}
        onPress={() => setShowBadgeModal(true)}
        activeOpacity={0.7}
      >
        <Animated.View style={[
          styles.badge,
          { transform: [{ scale: pulseAnim }] }
        ]}>
          <Text style={styles.badgeEmoji}>{badgeStats.currentBadgeEmoji}</Text>
          <Text style={styles.badgeName}>{badgeStats.currentBadge}</Text>
        </Animated.View>
      </TouchableOpacity>

      <Modal
        visible={showBadgeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBadgeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>🏆 Teu Badge de Listener</Text>
            
            <View style={styles.currentBadgeSection}>
              <Text style={styles.currentBadgeEmoji}>{badgeStats.currentBadgeEmoji}</Text>
              <Text style={styles.currentBadgeName}>{badgeStats.currentBadge}</Text>
              <Text style={styles.badgeLevel}>Nível {badgeStats.badgeLevel}</Text>
            </View>

            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>📊 Estatísticas</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Tempo total:</Text>
                <Text style={styles.statValue}>{formatTime(badgeStats.totalConversationTime)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Mensagens:</Text>
                <Text style={styles.statValue}>{badgeStats.totalMessages}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Conversas:</Text>
                <Text style={styles.statValue}>{badgeStats.conversationsCount}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Rating médio:</Text>
                <Text style={styles.statValue}>{badgeStats.averageRating.toFixed(1)} ⭐</Text>
              </View>
            </View>

            {badgeStats.nextBadge && (
              <View style={styles.nextBadgeSection}>
                <Text style={styles.nextBadgeTitle}>🎯 Próximo Badge</Text>
                <TouchableOpacity
                  style={styles.nextBadgeButton}
                  onPress={() => setShowNextBadgeModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.nextBadgeName}>
                    {badgeStats.nextBadge.emoji} {badgeStats.nextBadge.name}
                  </Text>
                  <Text style={styles.nextBadgeHint}>👆 Toca para ver requisitos</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.allBadgesSection}>
              <Text style={styles.allBadgesTitle}>🏆 Todos os Badges</Text>
              <View style={styles.badgesList}>
                <View style={[styles.badgeItem, badgeStats.badgeLevel >= 1 && styles.badgeItemUnlocked]}>
                  <Text style={styles.badgeItemEmoji}>🪶</Text>
                  <View style={styles.badgeItemInfo}>
                    <Text style={styles.badgeItemName}>Pebbie</Text>
                    <Text style={styles.badgeItemReq}>Automático</Text>
                  </View>
                </View>
                
                <View style={[styles.badgeItem, badgeStats.badgeLevel >= 2 && styles.badgeItemUnlocked]}>
                  <Text style={styles.badgeItemEmoji}>✨</Text>
                  <View style={styles.badgeItemInfo}>
                    <Text style={styles.badgeItemName}>Glowie</Text>
                    <Text style={styles.badgeItemReq}>60+ msgs • 1h+ • 4.2⭐</Text>
                  </View>
                </View>
                
                <View style={[styles.badgeItem, badgeStats.badgeLevel >= 3 && styles.badgeItemUnlocked]}>
                  <Text style={styles.badgeItemEmoji}>💌</Text>
                  <View style={styles.badgeItemInfo}>
                    <Text style={styles.badgeItemName}>Heartie</Text>
                    <Text style={styles.badgeItemReq}>180+ msgs • 3h+ • 4.4⭐</Text>
                  </View>
                </View>
                
                <View style={[styles.badgeItem, badgeStats.badgeLevel >= 4 && styles.badgeItemUnlocked]}>
                  <Text style={styles.badgeItemEmoji}>🌙</Text>
                  <View style={styles.badgeItemInfo}>
                    <Text style={styles.badgeItemName}>Lumi</Text>
                    <Text style={styles.badgeItemReq}>400+ msgs • 8h+ • 4.6⭐</Text>
                  </View>
                </View>
                
                <View style={[styles.badgeItem, badgeStats.badgeLevel >= 5 && styles.badgeItemUnlocked]}>
                  <Text style={styles.badgeItemEmoji}>🕊️</Text>
                  <View style={styles.badgeItemInfo}>
                    <Text style={styles.badgeItemName}>Seraphie</Text>
                    <Text style={styles.badgeItemReq}>850+ msgs • 18h+ • 4.8⭐</Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowBadgeModal(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Next Badge Details Modal */}
      <Modal
        visible={showNextBadgeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNextBadgeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>🎯 Próximo Badge</Text>
            
            {badgeStats?.nextBadge && (
              <>
                <View style={styles.nextBadgeDetailSection}>
                  <Text style={styles.nextBadgeDetailEmoji}>{badgeStats.nextBadge.emoji}</Text>
                  <Text style={styles.nextBadgeDetailName}>{badgeStats.nextBadge.name}</Text>
                  <Text style={styles.nextBadgeDetailLevel}>Nível {badgeStats.nextBadge.level}</Text>
                </View>

                <View style={styles.progressSection}>
                  <Text style={styles.progressTitle}>📊 Progresso para {badgeStats.nextBadge.name}</Text>
                  
                  <View style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressIcon}>⏰</Text>
                      <Text style={styles.progressLabel}>Tempo Total de Conversa</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[
                        styles.progressFill,
                        { width: `${getProgressPercentage(badgeStats.totalConversationTime, badgeStats.nextBadge.requirements.time)}%` }
                      ]} />
                    </View>
                    <Text style={styles.progressText}>
                      {formatTime(badgeStats.totalConversationTime)} / {formatTime(badgeStats.nextBadge.requirements.time)}
                    </Text>
                  </View>
                  
                  <View style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressIcon}>💬</Text>
                      <Text style={styles.progressLabel}>Mensagens Enviadas</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[
                        styles.progressFill,
                        { width: `${getProgressPercentage(badgeStats.totalMessages, badgeStats.nextBadge.requirements.messages)}%` }
                      ]} />
                    </View>
                    <Text style={styles.progressText}>
                      {badgeStats.totalMessages} / {badgeStats.nextBadge.requirements.messages}
                    </Text>
                  </View>
                  
                  <View style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressIcon}>⭐</Text>
                      <Text style={styles.progressLabel}>Rating Médio</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[
                        styles.progressFill,
                        { width: `${getProgressPercentage(badgeStats.averageRating, badgeStats.nextBadge.requirements.rating)}%` }
                      ]} />
                    </View>
                    <Text style={styles.progressText}>
                      {badgeStats.averageRating.toFixed(1)} / {badgeStats.nextBadge.requirements.rating}
                    </Text>
                  </View>
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowNextBadgeModal(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)', // Branco translúcido
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24, // Cantos muito arredondados
    borderWidth: 0,
    shadowColor: 'rgba(0,0,0,0.05)', // Sombras suaves
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  badgeEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4C3B68', // Deep Amethyst - Estabilidade
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#BDE0FE', // Sky Blue - Pureza, calma
    borderRadius: 24, // Cantos muito arredondados
    padding: 28, // Espaçamento generoso
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: 'rgba(0,0,0,0.1)', // Sombra suave
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#4A4A4A', // Dark Gray - Estabilidade
  },
  currentBadgeSection: {
    alignItems: 'center',
    marginBottom: 28,
    padding: 24,
    backgroundColor: 'rgba(255,200,221,0.3)', // Blush Pink com transparência
    borderRadius: 20, // Cantos muito arredondados
    shadowColor: 'rgba(255,200,221,0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  currentBadgeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  currentBadgeName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A4A4A', // Dark Gray - Estabilidade
    marginBottom: 6,
  },
  badgeLevel: {
    fontSize: 14,
    color: '#8A8A8A', // Light Gray - Acolhimento
    fontWeight: '500',
  },
  statsSection: {
    marginBottom: 28,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#4A4A4A', // Dark Gray - Estabilidade
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 15,
    color: '#8A8A8A', // Light Gray - Acolhimento
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A4A4A', // Dark Gray - Estabilidade
  },
  nextBadgeSection: {
    marginBottom: 28,
  },
  nextBadgeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#4A4A4A', // Dark Gray - Estabilidade
  },
  nextBadgeName: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    color: '#CDB4DB', // Lavender Dream - Espiritualidade
  },
  nextBadgeButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(205,180,219,0.2)', // Lavender Dream com transparência
    borderRadius: 20, // Cantos muito arredondados
    borderWidth: 0,
    marginBottom: 16,
    shadowColor: 'rgba(205,180,219,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  nextBadgeHint: {
    fontSize: 12,
    color: '#8A8A8A', // Light Gray - Acolhimento
    fontStyle: 'italic',
    fontWeight: '400',
  },
  progressSection: {
    gap: 12,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  progressLabel: {
    fontSize: 15,
    color: '#4A4A4A', // Dark Gray - Estabilidade
    fontWeight: '500',
  },
  progressBar: {
    height: 14,
    backgroundColor: 'rgba(138,138,138,0.2)', // Light Gray com transparência
    borderRadius: 8, // Cantos muito arredondados
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#CDB4DB', // Lavender Dream - Espiritualidade
    borderRadius: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#8A8A8A', // Light Gray - Acolhimento
    textAlign: 'center',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#CDB4DB', // Lavender Dream - Espiritualidade
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24, // Cantos muito arredondados
    alignItems: 'center',
    shadowColor: 'rgba(205,180,219,0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  allBadgesSection: {
    marginBottom: 25,
  },
  allBadgesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#4A4A4A', // Dark Gray - Estabilidade
  },
  badgesList: {
    gap: 8,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.7)', // Branco translúcido
    borderRadius: 16, // Cantos muito arredondados
    borderWidth: 0,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeItemUnlocked: {
    backgroundColor: 'rgba(255,200,221,0.4)', // Blush Pink com transparência
    shadowColor: 'rgba(255,200,221,0.3)',
  },
  badgeItemEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  badgeItemInfo: {
    flex: 1,
  },
  badgeItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A4A4A', // Dark Gray - Estabilidade
    marginBottom: 3,
  },
  badgeItemReq: {
    fontSize: 12,
    color: '#8A8A8A', // Light Gray - Acolhimento
    fontWeight: '400',
  },
  nextBadgeDetailSection: {
    alignItems: 'center',
    marginBottom: 28,
    padding: 24,
    backgroundColor: 'rgba(205,180,219,0.2)', // Lavender Dream com transparência
    borderRadius: 20, // Cantos muito arredondados
    borderWidth: 0,
    shadowColor: 'rgba(205,180,219,0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  nextBadgeDetailEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  nextBadgeDetailName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A4A4A', // Dark Gray - Estabilidade
    marginBottom: 4,
  },
  nextBadgeDetailLevel: {
    fontSize: 14,
    color: '#8A8A8A', // Light Gray - Acolhimento
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#4A4A4A', // Dark Gray - Estabilidade
  },
});

export default BadgeDisplay;
