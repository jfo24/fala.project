import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onRate: (rating: number) => void;
}

const { width } = Dimensions.get('window');

const RatingModal: React.FC<RatingModalProps> = ({ visible, onClose, onRate }) => {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const heartAnimations = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;
  const glowAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const handleRating = (rating: number) => {
    setSelectedRating(rating);
    
    // Animate the selected heart
    const heartAnimation = heartAnimations[rating - 1];
    const glowAnimation = glowAnimations[rating - 1];
    
    // Heart bounce animation
    Animated.sequence([
      Animated.timing(heartAnimation, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Glow animation
    Animated.sequence([
      Animated.timing(glowAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Delay before calling onRate to show animation
    setTimeout(() => {
      onRate(rating);
      onClose();
    }, 500);
  };

  const renderHeart = (index: number) => {
    const isSelected = index <= selectedRating;
    const isHovered = index <= hoveredRating;
    const heartAnimation = heartAnimations[index - 1];
    const glowAnimation = glowAnimations[index - 1];
    
    return (
      <TouchableOpacity
        key={index}
        style={styles.heartContainer}
        onPress={() => handleRating(index)}
        onPressIn={() => setHoveredRating(index)}
        onPressOut={() => setHoveredRating(0)}
        activeOpacity={0.8}
      >
        <Animated.View style={[
          styles.heartWrapper,
          {
            transform: [{ scale: heartAnimation }],
          }
        ]}>
          {/* Glow effect */}
          <Animated.View style={[
            styles.heartGlow,
            {
              opacity: glowAnimation,
              transform: [{ scale: glowAnimation }],
            }
          ]} />
          
          {/* Heart */}
          <Text style={[
            styles.heart,
            isSelected && styles.heartSelected,
            isHovered && styles.heartHovered
          ]}>
            ❤️
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Espero que estejas melhor</Text>
          <Text style={styles.subtitle}>Como foi a tua experiência?</Text>
          
          <View style={styles.heartsContainer}>
            {[1, 2, 3, 4, 5].map(renderHeart)}
          </View>
          
          <Text style={styles.ratingText}>
            {selectedRating === 0 
              ? 'Toca num coração para avaliar' 
              : `${selectedRating} de 5 corações`
            }
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    width: width * 0.9,
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  heartsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  heartContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  heartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff6b9d',
    shadowColor: '#ff6b9d',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  heart: {
    fontSize: 32,
    opacity: 0.3,
    textAlign: 'center',
  },
  heartSelected: {
    opacity: 1,
    color: '#ff1744',
  },
  heartHovered: {
    opacity: 0.6,
  },
  ratingText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 5,
  },
});

export default RatingModal;
