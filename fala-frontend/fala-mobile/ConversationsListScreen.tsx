import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';
import { Conversation, Message } from './types';

interface ConversationsListScreenProps {
  conversations: Conversation[];
  onConversationSelect: (conversation: Conversation) => void;
  onBack: () => void;
  onNewConversation: () => void;
  currentUserMode: 'talk' | 'listen' | null;
}

export default function ConversationsListScreen({ 
  conversations, 
  onConversationSelect, 
  onBack, 
  onNewConversation,
  currentUserMode
}: ConversationsListScreenProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatTime = (timestamp: string) => {
    // Handle invalid or empty timestamps
    if (!timestamp || timestamp === '' || timestamp === 'Invalid Date') {
      return 'Agora';
    }

    const date = new Date(timestamp);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Agora';
    }

    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    }
  };

  const getModeEmoji = (mode: 'talk' | 'listen') => {
    return mode === 'talk' ? '💬' : '👂';
  };

  const getModeText = (mode: 'talk' | 'listen') => {
    return mode === 'talk' ? 'Precisava de falar' : 'Queria ouvir';
  };

  const getUserModeText = (userMode: 'talk' | 'listen' | null) => {
    if (!userMode) return '';
    return userMode === 'talk' ? 'Estavas a falar' : 'Estavas a ouvir';
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        item.isActive && styles.activeConversation,
      ]}
      onPress={() => onConversationSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.partnerName.charAt(0).toUpperCase()}
        </Text>
        <View style={[
          styles.modeIndicator,
          currentUserMode === 'talk' ? styles.talkIndicator : styles.listenIndicator
        ]}>
          <Text style={styles.modeEmoji}>
            {getModeEmoji(currentUserMode || 'talk')}
          </Text>
        </View>
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.partnerName} numberOfLines={1}>
            {item.partnerName}
          </Text>
          <Text style={styles.messageTime}>
            {formatTime(item.lastMessageTime)}
          </Text>
        </View>
        
        <View style={styles.conversationFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.modeText}>
          {getUserModeText(currentUserMode)}
          {item.duration && ` • ${item.duration}`}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
          <TouchableOpacity style={styles.profileButton} onPress={onBack}>
            <Text style={styles.profileButtonText}>👤</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Conversas</Text>
          <TouchableOpacity style={styles.newChatButton} onPress={onNewConversation}>
            <Text style={styles.newChatText}>+ Nova</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Olá, {user?.name?.split(' ')[0] || 'amigo'}!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            As tuas conversas estão aqui. Toca numa para continuar ou inicia uma nova.
          </Text>
        </View>

        {/* Conversations List */}
        {conversations.length > 0 ? (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            style={styles.conversationsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.conversationsContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Ainda não tens conversas</Text>
            <Text style={styles.emptySubtitle}>
              Inicia uma nova conversa para começar a partilhar ou ouvir
            </Text>
            <TouchableOpacity style={styles.startChatButton} onPress={onNewConversation}>
              <Text style={styles.startChatText}>Iniciar Conversa</Text>
            </TouchableOpacity>
          </View>
        )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ecf0',
    backgroundColor: '#ffffff',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  newChatButton: {
    padding: 8,
  },
  newChatText: {
    color: '#6b5bff',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8ecf0',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  conversationsList: {
    flex: 1,
  },
  conversationsContent: {
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activeConversation: {
    backgroundColor: '#f8f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#6b5bff',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarText: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6b5bff',
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 50,
  },
  modeIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  talkIndicator: {
    backgroundColor: '#e74c3c',
  },
  listenIndicator: {
    backgroundColor: '#27ae60',
  },
  modeEmoji: {
    fontSize: 10,
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 8,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#6b5bff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modeText: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  startChatButton: {
    backgroundColor: '#6b5bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  startChatText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
