import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TalkerRequest {
  talkerId: string;
  talkerName: string;
  topic: string;
  duration: string;
  timestamp: string;
}

interface TalkerNotificationProps {
  request: TalkerRequest;
  onAccept: (request: TalkerRequest) => void;
  onDecline: () => void;
  onTimeout: () => void;
  visible: boolean;
}

const { width } = Dimensions.get('window');

export default function TalkerNotification({ 
  request, 
  onAccept, 
  onDecline, 
  onTimeout,
  visible 
}: TalkerNotificationProps) {
  const insets = useSafeAreaInsets();
  const [timeLeft, setTimeLeft] = useState(5);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Timer for countdown
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      // Reset values
      setTimeLeft(5);
      slideAnim.setValue(-200);
      progressAnim.setValue(1);
      pulseAnim.setValue(1);
      
      // Slide in animation
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
      
      // Pulse animation for urgency
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      // Countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      
      // Progress bar animation
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 5000, // 5 seconds
        useNativeDriver: false,
      }).start();
      
    } else {
      // Clean up timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [visible, slideAnim, progressAnim, pulseAnim]);

  // Handle timeout when timeLeft reaches 0
  useEffect(() => {
    if (timeLeft === 0 && visible) {
      onTimeout();
    }
  }, [timeLeft, visible, onTimeout]);

  const handleAccept = () => {
    onAccept(request);
  };

  const handleDecline = () => {
    onDecline();
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          top: insets.top + 10,
          transform: [
            { translateY: slideAnim },
            { scale: pulseAnim }
          ],
        }
      ]}
    >
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }
          ]}
        />
      </View>
      
      {/* Notification content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>💬</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Alguém precisa de falar</Text>
            <Text style={styles.timer}>{timeLeft}s</Text>
          </View>
        </View>
        
        <View style={styles.details}>
          <Text style={styles.userName}>{request.talkerName}</Text>
          <Text style={styles.topic}>Sobre: {request.topic}</Text>
          <Text style={styles.duration}>Tempo: {request.duration}</Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.declineButton}
            onPress={handleDecline}
            activeOpacity={0.7}
          >
            <Text style={styles.declineText}>Agora não</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={handleAccept}
            activeOpacity={0.7}
          >
            <Text style={styles.acceptText}>Vou ouvir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#e74c3c',
    borderRadius: 2,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  timer: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e74c3c',
    backgroundColor: '#ffeaea',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  details: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  topic: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  duration: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8ecf0',
  },
  declineText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#27ae60',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
