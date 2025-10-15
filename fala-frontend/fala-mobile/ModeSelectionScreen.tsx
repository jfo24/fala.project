import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  LinearGradient,
} from 'react-native';
import { useAuth } from './AuthContext';

const { width, height } = Dimensions.get('window');

interface ModeSelectionScreenProps {
  onModeSelected: (mode: 'talk' | 'listen') => void;
}

export default function ModeSelectionScreen({ onModeSelected }: ModeSelectionScreenProps) {
  const { user } = useAuth();
  const [selectedMode, setSelectedMode] = useState<'talk' | 'listen' | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Entrada suave
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

    // Animação de respiração contínua
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    breathingAnimation.start();

    return () => breathingAnimation.stop();
  }, []);

  const handleModeSelect = (mode: 'talk' | 'listen') => {
    setSelectedMode(mode);
    
    // Feedback emocional com brilho suave lilás
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 180, // Transição ease-in-out 180ms
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    // Pequeno pulse dourado após seleção
    setTimeout(() => {
      Animated.timing(pulseAnim, {
        toValue: 1.02,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    }, 200);

    setTimeout(() => {
      onModeSelected(mode);
    }, 400);
  };

  return (
    <View style={styles.container}>
      {/* Gradiente de fundo suave */}
      <View style={styles.gradientBackground} />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Header com saudação carinhosa */}
        <View style={styles.headerContainer}>
          <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] || 'amigo'} 💕</Text>
          <Text style={styles.subtitle}>Como te sentes hoje?</Text>
        </View>

        {/* Hero section com mensagem principal */}
        <View style={styles.heroContainer}>
          <View style={styles.heroIconContainer}>
            <Text style={styles.heroIcon}>🌸</Text>
          </View>
          <Text style={styles.heroTitle}>Estás aqui para</Text>
          <Text style={styles.heroSubtitle}>conectar com o coração</Text>
        </View>

        {/* Cards de modo com design moderno */}
        <View style={styles.cardsContainer}>
          {/* Card Falar */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[
                styles.modeCard,
                styles.talkCard,
                selectedMode === 'talk' && styles.selectedCard,
              ]}
              onPress={() => handleModeSelect('talk')}
              activeOpacity={0.8}
            >
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>💬</Text>
              </View>
              <Text style={styles.cardTitle}>Preciso de falar</Text>
              <Text style={styles.cardDescription}>
                Tenho algo no coração que preciso de partilhar
              </Text>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>Seguro & Anónimo</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Card Ouvir */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[
                styles.modeCard,
                styles.listenCard,
                selectedMode === 'listen' && styles.selectedCard,
              ]}
              onPress={() => handleModeSelect('listen')}
              activeOpacity={0.8}
            >
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>👂</Text>
              </View>
              <Text style={styles.cardTitle}>Quero ouvir</Text>
              <Text style={styles.cardDescription}>
                Estou aqui para te ouvir com o coração aberto
              </Text>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>Empático & Acolhedor</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer com mensagem inspiradora */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            ✨ Onde as palavras encontram o coração
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BDE0FE', // Sky Blue - Pureza, calma
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#BDE0FE', // Sky Blue base
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  
  // Header Section
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4C3B68', // Deep Amethyst
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#827397', // Muted Mauve
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Hero Section
  heroContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(242,198,222,0.3)', // Blush Petal com transparência
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: 'rgba(242,198,222,0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  heroIcon: {
    fontSize: 36,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A4A4A', // Dark Gray
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#8A8A8A', // Light Gray
    textAlign: 'center',
  },

  // Cards Section
  cardsContainer: {
    flex: 1,
    gap: 20,
  },
  modeCard: {
    backgroundColor: 'rgba(255,255,255,0.9)', // Branco translúcido
    borderRadius: 24,
    padding: 24,
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,200,221,0.2)', // Borda suave
  },
  selectedCard: {
    borderColor: '#CDB4DB', // Lavender Dream
    borderWidth: 2,
    shadowColor: 'rgba(205,180,219,0.4)',
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
    transform: [{ scale: 1.02 }],
  },
  talkCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#CDB4DB', // Lavender Dream
  },
  listenCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFC8DD', // Blush Pink
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(205,180,219,0.1)', // Lavender Dream com transparência
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A4A4A', // Dark Gray
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: '#8A8A8A', // Light Gray
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  cardBadge: {
    backgroundColor: 'rgba(255,200,221,0.3)', // Blush Pink com transparência
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  cardBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4C3B68', // Deep Amethyst
    textAlign: 'center',
  },

  // Footer Section
  footerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#827397', // Muted Mauve
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
  },
});

