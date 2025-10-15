import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TalkerRequest {
  userName: string;
  topic: string;
  duration: string;
  requestId: string;
}

interface TalkerRequestScreenProps {
  request: TalkerRequest;
  onAccept: (request: TalkerRequest) => void;
  onDecline: () => void;
}

export default function TalkerRequestScreen({ request, onAccept, onDecline }: TalkerRequestScreenProps) {
  const insets = useSafeAreaInsets();
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.8));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAccept = () => {
    Alert.alert(
      'Aceitar Conversa',
      `Tens a certeza que queres ouvir ${request.userName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sim, aceitar', 
          onPress: () => onAccept(request),
          style: 'default'
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
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Alguém precisa de falar</Text>
        </View>

        {/* Request Card */}
        <View style={styles.requestCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>💬</Text>
          </View>
          
          <Text style={styles.userName}>{request.userName}</Text>
          <Text style={styles.needsHelp}>precisa de falar</Text>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Sobre:</Text>
              <Text style={styles.detailValue}>{request.topic}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tempo:</Text>
              <Text style={styles.detailValue}>{request.duration}</Text>
            </View>
          </View>
        </View>

        {/* Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            Esta pessoa está a passar por um momento difícil e precisa de alguém que a ouça com empatia e sem julgamentos.
          </Text>
          <Text style={styles.messageText}>
            Estás disponível para ajudar?
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.declineButton} 
            onPress={onDecline}
            activeOpacity={0.8}
          >
            <Text style={styles.declineButtonText}>Não, obrigado</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.acceptButton} 
            onPress={handleAccept}
            activeOpacity={0.8}
          >
            <Text style={styles.acceptButtonText}>Sim, vou ouvir</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 36,
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  needsHelp: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  detailsContainer: {
    width: '100%',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 8,
    minWidth: 60,
  },
  detailValue: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  messageContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8ecf0',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

