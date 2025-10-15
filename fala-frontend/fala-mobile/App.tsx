import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  ListRenderItem,
  StatusBar,
  Animated,
  Keyboard,
  Alert
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
// import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { AuthProvider, useAuth } from './AuthContext';
import LoginScreen from './LoginScreen';
import NotificationService from './NotificationService';
import ModeSelectionScreen from './ModeSelectionScreen';
import ProfileScreen from './ProfileScreen';
import ConversationsListScreen from './ConversationsListScreen';
import TalkerRequestScreen from './TalkerRequestScreen';
import TalkerNotification from './components/TalkerNotification';
import RatingModal from './components/RatingModal';
import { Conversation as ConversationType, Message as MessageType } from './types';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.71:3000';
const API_URL = 'http://192.168.1.71:3000/api';

interface Message {
  from: 'user' | 'listener';
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  partnerName: string;
  partnerMode: 'talk' | 'listen';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isActive: boolean;
  messages: Message[];
  topic?: string;
  duration?: string;
}

function HearMeMobile() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [view, setView] = useState<'mode-selection' | 'onboard' | 'chat' | 'profile' | 'conversations' | 'talker-request'>('mode-selection');
  const [userMode, setUserMode] = useState<'talk' | 'listen' | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [matched, setMatched] = useState<boolean>(false);
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationType | null>(null);
  const [currentTalkerRequest, setCurrentTalkerRequest] = useState<any>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversationTimer, setConversationTimer] = useState<number | null>(null);
  const [isConversationExpired, setIsConversationExpired] = useState<boolean>(false);
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showMiraAI, setShowMiraAI] = useState<boolean>(false);
  const [showConversationsButton, setShowConversationsButton] = useState<boolean>(false);
  const [isMiraTyping, setIsMiraTyping] = useState<boolean>(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);
  const [showTalkerNotification, setShowTalkerNotification] = useState<boolean>(false);
  const [conversationsLoaded, setConversationsLoaded] = useState<boolean>(false);
  const [isAcceptingTalker, setIsAcceptingTalker] = useState<boolean>(false);
  
  // Function to invalidate cache when conversations change
  const invalidateConversationsCache = () => {
    setConversationsLoaded(false);
  };
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listenerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation refs for loading
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  
  // Animation refs for Mira AI button
  const miraFadeValue = useRef(new Animated.Value(0)).current;
  const miraScaleValue = useRef(new Animated.Value(0.8)).current;
  
  // Animation refs for typing dots
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;
  
  // Ref for FlatList to enable auto-scroll
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Initialize notifications
    const initializeNotifications = async () => {
      const notificationService = NotificationService.getInstance();
      const pushToken = await notificationService.initialize();
      console.log('Push token:', pushToken);
    };
    
    initializeNotifications();

    // Add notification listeners
    const notificationService = NotificationService.getInstance();
    
    // Handle notification received (when app is in foreground)
    const notificationListener = notificationService.addNotificationListener((notification: any) => {
      console.log('📱 Notification received:', notification);
    });
    
    // Handle notification response (when user taps notification)
    const notificationResponseListener = notificationService.addNotificationResponseListener((response: any) => {
      console.log('📱 Notification tapped:', response);
      const data = response.notification.request.content.data;
      
      if (data?.type === 'talker_request') {
        // User tapped on talker request notification
        console.log('User tapped talker request notification');
        // The app will handle this when it comes to foreground
      }
    });

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('=== SOCKET CONNECTED ===');
      console.log('Socket ID:', newSocket.id);
      console.log('User:', user);
      console.log('UserMode:', userMode);
      console.log('=== END SOCKET CONNECTED ===');
      
      // Register user with socket
      if (user && userMode) {
        console.log('Auto-registering user on connect:', {
          userId: user.id,
          userName: user.name,
          mode: userMode
        });
        newSocket.emit('register', {
          userId: user.id,
          userName: user.name,
          mode: userMode
        });
      } else {
        console.log('Cannot auto-register - missing user or userMode');
      }
    });

    newSocket.on('message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      // Scroll to bottom when receiving a message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    newSocket.on('matched', () => {
      setMatched(true);
      setView('chat');
    });

    // Listen for talker requests (for listeners)
    newSocket.on('talkerRequest', (request) => {
      console.log('🎉 === TALKER REQUEST RECEIVED ===');
      console.log('Request data:', request);
      console.log('Talker:', request.talkerName);
      console.log('Topic:', request.topic);
      console.log('Duration:', request.duration);
      console.log('Current userMode:', userMode);
      console.log('Current view:', view);
      console.log('=== END TALKER REQUEST ===');
      
      // Show compact notification instead of full screen
      setCurrentTalkerRequest(request);
      setShowTalkerNotification(true);
      console.log('✅ Showing compact talker notification');
      
      // Send push notification for listeners (even if app is in background)
      if (userMode === 'listen') {
        const notificationService = NotificationService.getInstance();
        notificationService.sendTalkerRequestNotification(
          request.talkerName || 'Alguém',
          request.topic || 'Precisa de falar',
          request.duration || 'Algum tempo'
        );
        console.log('📱 Push notification sent for listener');
      }
    });

    // Listen for confirmation that listeners were notified (for talkers)
    newSocket.on('listenersNotified', (data) => {
      console.log('=== LISTENERS NOTIFIED ===');
      console.log('Listeners count:', data.listenersCount);
      console.log('Message:', data.message);
      console.log('=== END LISTENERS NOTIFIED ===');
    });

    // Listen for available talkers (for listeners)
    newSocket.on('talkersAvailable', (data) => {
      console.log('=== TALKERS AVAILABLE ===');
      console.log('Available talkers:', data.count);
      console.log('Message:', data.message);
      console.log('=== END TALKERS AVAILABLE ===');
    });

    // Listen for partner typing
    newSocket.on('partnerTyping', (data) => {
      console.log('=== PARTNER TYPING ===');
      console.log('Partner is typing:', data.isTyping);
      console.log('=== END PARTNER TYPING ===');
      
      setIsPartnerTyping(data.isTyping);
    });

    // Listen for conversation expiration
    newSocket.on('conversationExpired', (data) => {
      console.log('=== CONVERSATION EXPIRED ===');
      console.log('Chat ID:', data.chatId);
      console.log('Message:', data.message);
      console.log('=== END CONVERSATION EXPIRED ===');
      
      setIsConversationExpired(true);
      setConversationTimer(0);
      
      // Show expiration message and redirect after 3 seconds
      setTimeout(() => {
        setView('conversations');
        loadUserConversations(true);
        setIsConversationExpired(false);
        setCurrentConversation(null);
        setMessages([]);
      }, 3000);
    });

    // Listen for talker occupied notification (for other listeners)
    newSocket.on('talkerOccupied', (data) => {
      console.log('=== TALKER OCCUPIED ===');
      console.log('Talker Name:', data.talkerName);
      console.log('Topic:', data.topic);
      console.log('Message:', data.message);
      console.log('=== END TALKER OCCUPIED ===');
      
      // Hide the current talker notification if it's for the same talker
      if (currentTalkerRequest && currentTalkerRequest.talkerName === data.talkerName) {
        setShowTalkerNotification(false);
        setCurrentTalkerRequest(null);
      }
      
      // Show a brief notification that the talker is now occupied
      Alert.alert(
        'Alguém já está a ouvir',
        data.message,
        [{ text: 'OK', style: 'default' }]
      );
    });

    // Listen for talker already occupied (when trying to accept an already taken talker)
    newSocket.on('talkerAlreadyOccupied', (data) => {
      console.log('=== TALKER ALREADY OCCUPIED ===');
      console.log('Talker Name:', data.talkerName);
      console.log('Message:', data.message);
      console.log('=== END TALKER ALREADY OCCUPIED ===');
      
      // Hide the current talker notification
      setShowTalkerNotification(false);
      setCurrentTalkerRequest(null);
      
      // Show alert that the talker is already being listened to
      Alert.alert(
        'Já está a ser ouvido',
        data.message,
        [{ text: 'OK', style: 'default' }]
      );
    });

    // Listen for chat ready (for listeners who accepted)
    newSocket.on('chatReady', (data) => {
      console.log('=== CHAT READY ===');
      console.log('Chat ID:', data.chatId);
      console.log('Talker Name:', data.talkerName);
      console.log('Topic:', data.topic);
      console.log('Duration:', data.duration);
      console.log('User Mode:', userMode);
      console.log('Current View:', view);
      console.log('=== END CHAT READY ===');
      
      // Create conversation object for the listener using data from backend
      const conversation: ConversationType = {
        id: data.chatId,
        partnerName: data.talkerName || 'Talker',
        partnerMode: 'talk',
        lastMessage: 'Conversa iniciada',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isActive: true,
        topic: data.topic || 'General',
        duration: data.duration || 'Unknown',
        messages: []
      };

      console.log('Created conversation for listener:', conversation);
      console.log('Duration received from backend:', data.duration);
      console.log('Duration set in conversation:', conversation.duration);

      // Set current conversation and navigate to chat
      setCurrentConversation(conversation);
      setMessages([]);
      setView('chat');
      
      // Start timer for the new conversation
      console.log('=== STARTING TIMER FOR NEW CONVERSATION (chatReady) ===');
      console.log('Conversation:', conversation);
      console.log('Duration from conversation:', conversation.duration);
      
      // Reset conversation timer state
      setIsConversationExpired(false);
      
      // Try to get duration from conversation data, fallback to 15 minutes
      let fallbackDuration = 15 * 60; // 15 minutes in seconds
      
      if (conversation.duration) {
        console.log('Parsing duration:', conversation.duration);
        if (conversation.duration.includes('1 min')) {
          fallbackDuration = 1 * 60; // 1 minute
        } else if (conversation.duration.includes('15 min')) {
          fallbackDuration = 15 * 60; // 15 minutes
        } else if (conversation.duration.includes('30 min')) {
          fallbackDuration = 30 * 60; // 30 minutes
        } else if (conversation.duration.includes('45 min')) {
          fallbackDuration = 45 * 60; // 45 minutes
        } else if (conversation.duration.includes('1 hora')) {
          fallbackDuration = 60 * 60; // 60 minutes
        }
        console.log('Parsed duration to seconds:', fallbackDuration);
      } else {
        console.log('No duration found, using fallback:', fallbackDuration);
      }
      
      // Set timer immediately with estimated duration
      setConversationTimer(fallbackDuration);
      console.log('Timer set immediately for new conversation:', fallbackDuration, 'seconds');
      
      // Then sync with backend for accurate time
      startConversationTimer(conversation.id);
      
      // Invalidate cache since we have a new conversation
      invalidateConversationsCache();
      
      // Clear loading states
      setIsLoading(false);
      setIsSearching(false);
      
      // Clear notification states
      setCurrentTalkerRequest(null);
      setShowTalkerNotification(false);
      setIsAcceptingTalker(false);
      
      console.log('Listener should now be in chat view');
    });

    // Listen for listener found (for talkers)
    newSocket.on('listenerFound', (data) => {
      console.log('=== LISTENER FOUND ===');
      console.log('Chat ID:', data.chatId);
      console.log('Listener Name:', data.listenerName);
      console.log('=== END LISTENER FOUND ===');
      
      // Create conversation object for the talker
      const conversation: ConversationType = {
        id: data.chatId,
        partnerName: data.listenerName,
        partnerMode: 'listen',
        lastMessage: 'Conversa iniciada',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isActive: true,
        topic: topic,
        duration: duration,
        messages: []
      };

      // Set current conversation and navigate to chat
      setCurrentConversation(conversation);
      setMessages([]);
      setView('chat');
      
      // Start timer for the new conversation
      console.log('=== STARTING TIMER FOR NEW CONVERSATION (listenerFound) ===');
      console.log('Conversation:', conversation);
      console.log('Duration from conversation:', conversation.duration);
      
      // Reset conversation timer state
      setIsConversationExpired(false);
      
      // Try to get duration from conversation data, fallback to 15 minutes
      let fallbackDuration = 15 * 60; // 15 minutes in seconds
      
      if (conversation.duration) {
        console.log('Parsing duration:', conversation.duration);
        if (conversation.duration.includes('1 min')) {
          fallbackDuration = 1 * 60; // 1 minute
        } else if (conversation.duration.includes('15 min')) {
          fallbackDuration = 15 * 60; // 15 minutes
        } else if (conversation.duration.includes('30 min')) {
          fallbackDuration = 30 * 60; // 30 minutes
        } else if (conversation.duration.includes('45 min')) {
          fallbackDuration = 45 * 60; // 45 minutes
        } else if (conversation.duration.includes('1 hora')) {
          fallbackDuration = 60 * 60; // 60 minutes
        }
        console.log('Parsed duration to seconds:', fallbackDuration);
      } else {
        console.log('No duration found, using fallback:', fallbackDuration);
      }
      
      // Set timer immediately with estimated duration
      setConversationTimer(fallbackDuration);
      console.log('Timer set immediately for new conversation:', fallbackDuration, 'seconds');
      
      // Then sync with backend for accurate time
      startConversationTimer(conversation.id);
      
      // Invalidate cache since we have a new conversation
      invalidateConversationsCache();
      
      // Clear loading states
      setIsLoading(false);
      setIsSearching(false);
      setShowMiraAI(false);
    });

    // Socket listeners removed for simple solution

    return () => {
      newSocket.disconnect();
      
      // Clear notification listeners
      notificationListener.remove();
      notificationResponseListener.remove();
      
      // Clear timeout on cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [user, userMode]);

  // Animation effect for loading
  useEffect(() => {
    console.log('Animation useEffect triggered - isLoading:', isLoading);
    if (isLoading) {
      // Fade in animation
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Scale animation
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Continuous spin animation
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );

      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      spinAnimation.start();
      pulseAnimation.start();

      return () => {
        spinAnimation.stop();
        pulseAnimation.stop();
        fadeValue.setValue(0);
        scaleValue.setValue(0.8);
        spinValue.setValue(0);
        pulseValue.setValue(1);
      };
    }
  }, [isLoading, spinValue, pulseValue, fadeValue, scaleValue]);

  // Animation for typing dots
  useEffect(() => {
    if (isMiraTyping) {
      const createDotAnimation = (dotRef: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dotRef, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(dotRef, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          ])
        );
      };

      const dot1Animation = createDotAnimation(dot1Opacity, 0);
      const dot2Animation = createDotAnimation(dot2Opacity, 200);
      const dot3Animation = createDotAnimation(dot3Opacity, 400);

      dot1Animation.start();
      dot2Animation.start();
      dot3Animation.start();

      return () => {
        dot1Animation.stop();
        dot2Animation.stop();
        dot3Animation.stop();
        dot1Opacity.setValue(0.3);
        dot2Opacity.setValue(0.3);
        dot3Opacity.setValue(0.3);
      };
    }
  }, [isMiraTyping, dot1Opacity, dot2Opacity, dot3Opacity]);

  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log('showMiraAI state changed to:', showMiraAI);
  }, [showMiraAI]);

  useEffect(() => {
    console.log('=== STATE CHANGE ===');
    console.log('showConversationsButton state changed to:', showConversationsButton);
    console.log('showMiraAI state changed to:', showMiraAI);
    console.log('Current userMode:', userMode);
    console.log('Current isLoading:', isLoading);
    console.log('=== END STATE CHANGE ===');
  }, [showConversationsButton, showMiraAI, userMode, isLoading]);

  // Function to scroll to bottom of chat
  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Handle keyboard events for better UX
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // Scroll to bottom when keyboard appears
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Optional: handle keyboard hide if needed
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [messages]);

  const handleModeSelected = (mode: 'talk' | 'listen') => {
    setUserMode(mode);
    setView('onboard');
  };

  const handleModeChange = (newMode: 'talk' | 'listen') => {
    setUserMode(newMode);
    setView('onboard');
  };

  const startChat = async () => {
    console.log('startChat called with userMode:', userMode);
    
    // Clear all previous states to avoid conflicts
    setShowMiraAI(false);
    setShowConversationsButton(false);
    setIsSearching(false);
    
    if (userMode === 'talk') {
      // Start loading and searching for listeners
      setIsLoading(true);
      setIsSearching(true);
      
      // Register as talker and notify listeners
      try {
        if (socket && user) {
          // First register as talker
          console.log('Registering talker via WebSocket:', {
            userId: user.id,
            userName: user.name,
            mode: userMode
          });
          
          socket.emit('register', {
            userId: user.id,
            userName: user.name,
            mode: userMode
          });
          
          // Then send talker request to notify all listeners
          setTimeout(() => {
            socket.emit('talkerRequest', {
              userId: user.id,
              userName: user.name,
              topic: topic,
              duration: duration
            });
            console.log('Talker request sent to notify listeners');
          }, 1000); // Wait 1 second for registration to complete
        }
        
        // Check for available listeners
        const response = await fetch(`${API_URL}/listeners/available`);
        const result = await response.json();
        
        if (result.success) {
          console.log(`Found ${result.count} available listeners`);
          
          if (result.count > 0) {
            // Show that we're actively searching
            console.log('Listeners available, showing search status');
          } else {
            console.log('No listeners available, will show Mira AI option');
          }
        }
      } catch (error) {
        console.error('Error checking for listeners:', error);
      }
      
      // After 5 seconds, show Mira AI button but keep loading
      setTimeout(() => {
        console.log('5 seconds passed - showing Mira AI option');
        setShowMiraAI(true);
        
        // Animate Mira AI button appearance
        Animated.parallel([
          Animated.timing(miraFadeValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.spring(miraScaleValue, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      }, 5000);
      
    } else if (userMode === 'listen') {
      console.log('Entering listener mode - setting up loading screen');
      // Listener mode: show loading screen waiting for a talker
      setIsLoading(true);
      setIsSearching(true);

      // After 5 seconds, show "My conversations" button
      console.log('Setting up listener timeout for 5 seconds');
      listenerTimeoutRef.current = setTimeout(() => {
        console.log('=== LISTENER TIMEOUT EXECUTED ===');
        console.log('5 seconds passed - showing My conversations option for listener');
        console.log('Setting showConversationsButton to true for listener mode');
        setShowConversationsButton(true);
        
        // Animate button appearance for listener
        Animated.parallel([
          Animated.timing(miraFadeValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.spring(miraScaleValue, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
        
        console.log('showConversationsButton state should now be true');
        console.log('=== END LISTENER TIMEOUT ===');
      }, 5000);
      
      // Also set a backup timeout to ensure it works
      setTimeout(() => {
        console.log('BACKUP TIMEOUT - Force setting showConversationsButton to true');
        setShowConversationsButton(true);
      }, 6000);

      // Register as listener with the backend via WebSocket
      try {
        console.log('=== LISTENER REGISTRATION ATTEMPT ===');
        console.log('Socket available:', !!socket);
        console.log('User available:', !!user);
        console.log('UserMode:', userMode);
        console.log('Socket connected:', socket?.connected);
        console.log('=== END LISTENER REGISTRATION ATTEMPT ===');
        
        if (socket && user) {
          console.log('Registering listener via WebSocket:', {
            userId: user.id,
            userName: user.name,
            mode: userMode
          });
          
          socket.emit('register', {
            userId: user.id,
            userName: user.name,
            mode: userMode
          });
          console.log('✅ Listener registered via WebSocket');
        } else {
          console.error('❌ Socket or user not available for listener registration');
          console.error('Socket:', socket);
          console.error('User:', user);
        }
      } catch (error) {
        console.error('❌ Listener registration error:', error);
      }
    }
  };

  const handleConversationSelect = (conversation: ConversationType) => {
    console.log('=== CONVERSATION SELECTED ===');
    console.log('Selected conversation:', conversation);
    console.log('Current isSearching state:', isSearching);
    
    // Clear searching state when opening a conversation
    setIsSearching(false);
    setIsLoading(false);
    
    setCurrentConversation(conversation);
    setMessages(conversation.messages);
    
    // Reset conversation timer state
    setIsConversationExpired(false);
    
    // Start timer for real user conversations (not Mira AI)
    if (conversation.partnerName !== 'Mira AI') {
      console.log('=== STARTING TIMER FOR CONVERSATION ===');
      console.log('Conversation:', conversation);
      console.log('Duration from conversation:', conversation.duration);
      
      // Try to get duration from conversation data, fallback to 15 minutes
      let fallbackDuration = 15 * 60; // 15 minutes in seconds
      
      if (conversation.duration) {
        console.log('Parsing duration:', conversation.duration);
        if (conversation.duration.includes('1 min')) {
          fallbackDuration = 1 * 60; // 1 minute
        } else if (conversation.duration.includes('15 min')) {
          fallbackDuration = 15 * 60; // 15 minutes
        } else if (conversation.duration.includes('30 min')) {
          fallbackDuration = 30 * 60; // 30 minutes
        } else if (conversation.duration.includes('45 min')) {
          fallbackDuration = 45 * 60; // 45 minutes
        } else if (conversation.duration.includes('1 hora')) {
          fallbackDuration = 60 * 60; // 60 minutes
        }
        console.log('Parsed duration to seconds:', fallbackDuration);
      } else {
        console.log('No duration found, using fallback:', fallbackDuration);
      }
      
      // Set timer immediately with estimated duration
      setConversationTimer(fallbackDuration);
      console.log('Timer set immediately:', fallbackDuration, 'seconds');
      
      // Then sync with backend for accurate time
      startConversationTimer(conversation.id);
    } else {
      console.log('Mira AI conversation, no timer needed');
      setConversationTimer(null); // No timer for Mira AI
    }
    
    // Mark as read
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unreadCount: 0, isActive: true }
          : { ...conv, isActive: false }
      )
    );
    
    console.log('Navigating to chat view');
    setView('chat');
  };

  const handleNewConversation = () => {
    // Clear all states when starting a new conversation
    setShowMiraAI(false);
    setShowConversationsButton(false);
    setIsLoading(false);
    setIsSearching(false);
    setCurrentConversation(null);
    setMessages([]);
    setShowTalkerNotification(false);
    setView('mode-selection');
  };


  const handleNotificationTimeout = () => {
    console.log('=== NOTIFICATION TIMEOUT ===');
    
    // Hide notification
    setShowTalkerNotification(false);
    
    console.log('Talker notification timed out');
  };

  // Handle conversation rating
  const handleRating = async (rating: number) => {
    console.log('=== CONVERSATION RATED ===');
    console.log('Rating:', rating);
    console.log('Conversation ID:', currentConversation?.id);
    
    try {
      // Send rating to backend
      const response = await fetch(`${API_URL}/conversation/${currentConversation?.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: rating,
          userId: user?.id,
        }),
      });

      if (response.ok) {
        console.log('Rating saved successfully');
      } else {
        console.log('Failed to save rating');
      }
    } catch (error) {
      console.log('Error saving rating:', error);
    }

    // Close rating modal and redirect to conversations
    setShowRatingModal(false);
    setView('conversations');
    loadUserConversations(true);
    setIsConversationExpired(false);
    setCurrentConversation(null);
    setMessages([]);
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (currentConversation && currentConversation.partnerName !== 'Mira AI' && socket) {
      // Send typing event to partner
      socket.emit('typing', {
        chatId: currentConversation.id,
        isTyping: true
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          chatId: currentConversation.id,
          isTyping: false
        });
      }, 3000);
    }
  };

  // Load user conversations from backend (with cache optimization)
  // Check conversation status and handle expiration
  const checkConversationStatus = async (chatId: string) => {
    try {
      const response = await fetch(`${API_URL}/conversation/${chatId}/status`);
      const data = await response.json();
      
      if (data.isExpired) {
        setIsConversationExpired(true);
        setConversationTimer(0);
        
        // Show expiration message and redirect after 3 seconds
        setTimeout(() => {
          setView('conversations');
          loadUserConversations(true);
          setIsConversationExpired(false);
          setCurrentConversation(null);
          setMessages([]);
        }, 3000);
        
        return false; // Conversation expired
      }
      
      // Update timer with remaining time immediately
      if (data.timeRemaining !== null && data.timeRemaining !== undefined) {
        const remainingSeconds = Math.max(0, Math.floor(data.timeRemaining / 1000));
        setConversationTimer(remainingSeconds);
        console.log('Timer updated from backend:', remainingSeconds, 'seconds');
      }
      
      return true; // Conversation still active
    } catch (error) {
      console.error('Error checking conversation status:', error);
      return true; // Assume active if check fails
    }
  };

  // Start conversation timer
  const startConversationTimer = (chatId: string) => {
    // First, get the initial status and set timer immediately
    checkConversationStatus(chatId).then((isActive) => {
      if (!isActive) return;
      
      // Start the interval for continuous updates
      const timerInterval = setInterval(async () => {
        const isActive = await checkConversationStatus(chatId);
        if (!isActive) {
          clearInterval(timerInterval);
          return;
        }
        
        setConversationTimer(prev => {
          console.log('Timer tick:', prev);
          if (prev === null || prev <= 0) {
            clearInterval(timerInterval);
            // Mark conversation as expired when timer reaches 0
            setIsConversationExpired(true);
            
            console.log('=== TIMER REACHED 0 ===');
            console.log('User mode:', userMode);
            console.log('Current conversation:', currentConversation);
            console.log('Partner name:', currentConversation?.partnerName);
            
            // Show rating modal for talkers only (not listeners)
            if (userMode === 'talk') {
              console.log('Showing rating modal for talker');
              setShowRatingModal(true);
            } else {
              console.log('Not showing rating modal - user is listener');
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return timerInterval;
    });
  };

  const loadUserConversations = async (forceReload = false) => {
    try {
      const userId = user?.id;
      
      if (!userId) {
        console.error('No user ID available');
        return;
      }

      // If conversations already loaded and not forcing reload, skip
      if (conversationsLoaded && !forceReload) {
        console.log('Conversations already loaded, skipping API call');
        return;
      }

      console.log('=== LOADING CONVERSATIONS ===');
      console.log('Loading conversations for user:', userId);
      console.log('Force reload:', forceReload);
      
      const response = await fetch(`${API_URL}/conversations/${userId}`);
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);
      
      if (result.success) {
        console.log('API call successful, conversations:', result.conversations);
        
        // Use only conversations from backend - no automatic Mira AI addition
        const backendConversations = result.conversations || [];
        
        console.log('Setting conversations from backend only:', backendConversations);
        setConversations(backendConversations);
        setConversationsLoaded(true); // Mark as loaded
        console.log('Conversations updated successfully');
      } else {
        console.log('No conversations found, setting empty array');
        // Set empty array if no conversations found
        setConversations([]);
        setConversationsLoaded(true); // Mark as loaded even if empty
        console.log('Set empty conversations array');
      }
      console.log('=== END LOADING CONVERSATIONS ===');
    } catch (error) {
      console.error('Error loading conversations:', error);
      console.log('=== ERROR IN LOADING CONVERSATIONS ===');
      // Set empty array on error
      setConversations([]);
      setConversationsLoaded(true); // Mark as loaded even on error
    }
  };

  const handleAcceptTalker = (request: any) => {
    console.log('=== ACCEPTING TALKER REQUEST ===');
    console.log('Request:', request);
    console.log('IsAcceptingTalker:', isAcceptingTalker);
    
    // Prevent multiple clicks
    if (isAcceptingTalker) {
      console.log('Already accepting talker - ignoring duplicate request');
      return;
    }
    
    setIsAcceptingTalker(true);
    
    // Hide notification
    setShowTalkerNotification(false);
    
    if (socket) {
      socket.emit('acceptTalker', {
        requestId: request.timestamp, // Use timestamp as requestId
        listenerId: user?.id,
        talkerData: {
          userId: request.talkerId,
          socketId: null, // Will be found by userId in backend
          listenerName: user?.name,
          topic: request.topic,
          duration: request.duration
        }
      });
    }
    
    // Reset accepting state after a delay
    setTimeout(() => {
      setIsAcceptingTalker(false);
    }, 3000);
    
    // Don't clear currentTalkerRequest yet - we need it for chatReady event
  };

  const handleDeclineTalker = () => {
    console.log('=== DECLINING TALKER REQUEST ===');
    
    // Hide notification
    setShowTalkerNotification(false);
    
    setCurrentTalkerRequest(null);
    setView('conversations');
  };

  const cancelSearch = () => {
    setIsSearching(false);
    setIsLoading(false);
    setShowMiraAI(false);
    setShowConversationsButton(false);
    
    // Clear timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setSearchTimeout(null);
    }
    if (listenerTimeoutRef.current) {
      clearTimeout(listenerTimeoutRef.current);
      listenerTimeoutRef.current = null;
    }
    
    setView('onboard');
  };

  const startChatWithMiraAI = async () => {
    console.log('Starting chat with Mira AI');
    setShowMiraAI(false);
    setIsSearching(false); // Stop searching when user chooses Mira AI
    // Don't set isLoading to false yet - wait until conversation is ready

    try {
      if (!user?.id) {
        console.error('No user ID available for Mira AI conversation');
        return;
      }
      
      console.log('Making request to:', `${API_URL}/mira-ai/start`);
      console.log('Request data:', {
        userId: user.id,
        topic: topic,
        duration: duration
      });
      
      // Create Mira AI conversation in backend
      const response = await fetch(`${API_URL}/mira-ai/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          topic: topic,
          duration: duration
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Response result:', result);
      
      if (result.success) {
        console.log('Mira AI conversation created:', result.chatId);
        
        // Create conversation object for frontend
        const miraConversation: ConversationType = {
          id: result.chatId,
          partnerName: 'Mira AI',
          partnerMode: 'listen',
          lastMessage: 'Olá, querido! 💙 Sou a Mira, a tua amiga. Estou aqui para te ouvir e ajudar. Como te sentes hoje? O que se passa?',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          isActive: true,
          topic: topic,
          duration: duration,
          messages: [{
            from: 'listener',
            text: 'Olá, querido! 💙 Sou a Mira, a tua amiga. Estou aqui para te ouvir e ajudar. Como te sentes hoje? O que se passa?',
            time: new Date().toISOString()
          }]
        };

        setCurrentConversation(miraConversation);
        setMessages(miraConversation.messages);
        setIsLoading(false); // Stop loading now that conversation is ready
        setView('chat');
        
        // Invalidate cache since we have a new conversation
        invalidateConversationsCache();
      } else {
        console.error('Failed to create Mira AI conversation:', result.error);
        // Fallback to local conversation if backend fails
        const miraConversation: ConversationType = {
          id: 'mira-ai-chat-fallback',
          partnerName: 'Mira AI',
          partnerMode: 'listen',
          lastMessage: 'Olá, querido! 💙 Sou a Mira, a tua amiga. Estou aqui para te ouvir e ajudar. Como te sentes hoje? O que se passa?',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          isActive: true,
          topic: topic,
          duration: duration,
          messages: [{
            from: 'listener',
            text: 'Olá, querido! 💙 Sou a Mira, a tua amiga. Estou aqui para te ouvir e ajudar. Como te sentes hoje? O que se passa?',
            time: new Date().toISOString()
          }]
        };

        setCurrentConversation(miraConversation);
        setMessages(miraConversation.messages);
        setIsLoading(false); // Stop loading now that conversation is ready
        setView('chat');
        
        // Invalidate cache since we have a new conversation
        invalidateConversationsCache();
      }
    } catch (error) {
      console.error('Error creating Mira AI conversation:', error);
      // Fallback to local conversation
      const miraConversation: ConversationType = {
        id: 'mira-ai-chat-error',
        partnerName: 'Mira AI',
        partnerMode: 'listen',
        lastMessage: 'Olá, querido! 💙 Sou a Mira, a tua amiga. Estou aqui para te ouvir e ajudar. Como te sentes hoje? O que se passa?',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isActive: true,
        topic: topic,
        duration: duration,
        messages: [{
          from: 'listener',
          text: 'Olá, querido! 💙 Sou a Mira, a tua amiga. Estou aqui para te ouvir e ajudar. Como te sentes hoje? O que se passa?',
          time: new Date().toISOString()
        }]
      };

      setCurrentConversation(miraConversation);
      setMessages(miraConversation.messages);
      setView('chat');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentConversation) return;
    
    // Block messages if conversation is expired
    if (isConversationExpired) {
      console.log('Cannot send message: conversation expired');
      return;
    }
    const msg: MessageType = { from: 'user', text: input.trim(), time: new Date().toISOString() };
    
    // Clear input immediately for better UX
    setInput('');
    
    setMessages((prev) => [...prev, msg]);

    // Update conversation with new message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === currentConversation.id
          ? {
              ...conv,
              lastMessage: msg.text,
              lastMessageTime: msg.time,
              messages: [...conv.messages, msg]
            }
          : conv
      )
    );

    // Scroll to bottom after adding message
    scrollToBottom();
    
    // Send message via WebSocket for real user conversations
    if (currentConversation.partnerName !== 'Mira AI' && socket) {
      console.log('=== SENDING MESSAGE VIA WEBSOCKET ===');
      console.log('Chat ID:', currentConversation.id);
      console.log('Message:', msg.text);
      console.log('From:', msg.from);
      console.log('=== END SENDING MESSAGE ===');
      
      socket.emit('message', {
        chatId: currentConversation.id,
        from: 'user',
        text: msg.text,
        timestamp: msg.time
      });
    }

    // Save user message to backend if it's a Mira AI conversation
    if (currentConversation.partnerName === 'Mira AI' && currentConversation.id !== 'mira-ai-chat-fallback' && currentConversation.id !== 'mira-ai-chat-error') {
      try {
        await fetch(`${API_URL}/mira-ai/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: currentConversation.id,
            from: 'user',
            text: msg.text
          }),
        });
      } catch (error) {
        console.error('Error saving user message to backend:', error);
      }
    }

    // Handle Mira AI responses
    if (currentConversation.partnerName === 'Mira AI') {
      // Show typing animation immediately
      console.log('=== MIRA AI TYPING START ===');
      console.log('Setting isMiraTyping to true');
      console.log('Current conversation:', currentConversation);
      setIsMiraTyping(true);
      
      // Call OpenAI API for Mira AI response
      try {
        const conversationHistory = messages.slice(-10); // Last 10 messages for context
        
        const response = await fetch(`${API_URL}/mira-ai`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: msg.text,
            conversationHistory: conversationHistory
          }),
        });

        const result = await response.json();
        
        let aiResponse;
        let typingTime = 2000; // Default 2 seconds
        
        if (result.success && result.response) {
          aiResponse = result.response;
          typingTime = result.typingTime || 2000; // Use calculated typing time
        } else {
          // Fallback response if API fails
          aiResponse = result.fallback || "Sinto muito, querido... estou a ter dificuldades técnicas. Mas sabe que é? Estou aqui para ti, mesmo assim. 💙";
          typingTime = Math.max(1000, (aiResponse.length / 5) * 100); // Calculate fallback typing time
        }
        
        // Wait for the calculated typing time before showing the response
        setTimeout(() => {
          // Stop typing animation
          console.log('=== MIRA AI TYPING STOP ===');
          console.log('Setting isMiraTyping to false');
          setIsMiraTyping(false);
          
          const aiMsg: MessageType = { 
            from: 'listener', 
            text: aiResponse, 
            time: new Date().toISOString() 
          };
          
          setMessages((prev) => [...prev, aiMsg]);
          
          // Save Mira AI response to backend
          if (currentConversation.id !== 'mira-ai-chat-fallback' && currentConversation.id !== 'mira-ai-chat-error') {
            fetch(`${API_URL}/mira-ai/message`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chatId: currentConversation.id,
                from: 'mira-ai',
                text: aiResponse
              }),
            }).catch(error => {
              console.error('Error saving Mira AI response to backend:', error);
            });
          }
          
          // Update conversation with AI response
          setConversations(prev => 
            prev.map(conv => 
              conv.id === currentConversation.id 
                ? { 
                    ...conv, 
                    lastMessage: aiMsg.text, 
                    lastMessageTime: aiMsg.time,
                    messages: [...conv.messages, aiMsg]
                  }
                : conv
            )
          );

          // Scroll to bottom after AI response
          scrollToBottom();
        }, typingTime);
        
      } catch (error) {
        console.error('Mira AI API Error:', error);
        
        // Stop typing animation after a short delay
        setTimeout(() => {
          setIsMiraTyping(false);
          
          // Fallback response
          const fallbackMsg: MessageType = { 
            from: 'listener', 
            text: "Sinto muito, querido... estou a ter dificuldades técnicas. Mas sabe que é? Estou aqui para ti, mesmo assim. 💙", 
            time: new Date().toISOString() 
          };
          
          setMessages((prev) => [...prev, fallbackMsg]);
          
          setConversations(prev => 
            prev.map(conv => 
              conv.id === currentConversation.id 
                ? { 
                    ...conv, 
                    lastMessage: fallbackMsg.text, 
                    lastMessageTime: fallbackMsg.time,
                    messages: [...conv.messages, fallbackMsg]
                  }
                : conv
            )
          );

          // Scroll to bottom after fallback response
          scrollToBottom();
        }, 1500); // 1.5 seconds for error case
      }
    } else {
      // Regular socket message for human listeners
      if (socket) {
        socket.emit('message', msg);
      }
    }
  };

  const renderMessage: ListRenderItem<MessageType> = ({ item }) => (
    <View style={[styles.messageContainer, item.from === 'user' ? styles.userMsg : styles.listenerMsg]}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timeText}>{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
    </View>
  );

  if (isLoading) {
    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <>
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
          <StatusBar barStyle="dark-content" backgroundColor="#ff6b9d" />
        <Animated.View style={[styles.loadingContainer, { opacity: fadeValue }]}>
          {/* Background gradient effect */}
          <View style={styles.loadingBackground} />
          
          {/* Main loading animation */}
          <Animated.View style={[styles.loadingAnimation, { transform: [{ scale: scaleValue }] }]}>
            {/* Outer spinning ring */}
            <Animated.View style={[styles.spinningRing, { transform: [{ rotate: spin }] }]}>
              <View style={styles.ringGradient} />
            </Animated.View>
            
            {/* Inner pulsing circle */}
            <Animated.View style={[styles.pulsingCircle, { transform: [{ scale: pulseValue }] }]}>
              <View style={styles.innerGradient} />
            </Animated.View>
            
            {/* Center heart icon */}
            <View style={styles.heartContainer}>
              <Text style={styles.heartIcon}>💖</Text>
            </View>
          </Animated.View>
          
          {/* Floating particles */}
          <View style={styles.particlesContainer}>
            <Animated.View style={[styles.particle, styles.particle1, { transform: [{ rotate: spin }] }]} />
            <Animated.View style={[styles.particle, styles.particle2, { transform: [{ rotate: spin }] }]} />
            <Animated.View style={[styles.particle, styles.particle3, { transform: [{ rotate: spin }] }]} />
          </View>
          
          {/* Text content */}
          <View style={styles.loadingTextContainer}>
            <Animated.Text style={[styles.loadingTitle, { opacity: fadeValue }]}>
              A conectar-te...
            </Animated.Text>
            <Animated.Text style={[styles.loadingSubtitle, { opacity: fadeValue }]}>
              {userMode === 'talk' 
                ? (showMiraAI
                    ? "Ainda a procurar... ou fala com a Mira AI"
                    : "Estamos a procurar alguém especial para te ouvir")
                : (showMiraAI
                    ? "Ainda à espera... ou vê as tuas conversas"
                    : "Estamos à espera de alguém que precise de falar")
              }
            </Animated.Text>
          </View>
          
          {/* Debug info - check console for button render state */}

          {/* Mira AI Button - Only for talk mode */}
          {showMiraAI && !showConversationsButton && (
            <Animated.View style={[
              styles.miraAIContainer,
              {
                opacity: miraFadeValue,
                transform: [{ scale: miraScaleValue }]
              }
            ]}>
              <TouchableOpacity 
                style={styles.miraAIButton} 
                onPress={() => {
                  console.log('=== MIRA AI BUTTON CLICKED ===');
                  console.log('showMiraAI:', showMiraAI);
                  console.log('showConversationsButton:', showConversationsButton);
                  console.log('userMode:', userMode);
                  startChatWithMiraAI();
                }}
              >
                <View style={styles.miraAIIcon}>
                  <Text style={styles.miraAIEmoji}>🤖</Text>
                </View>
                <View style={styles.miraAITextContainer}>
                  <Text style={styles.miraAITitle}>Chat with Mira AI</Text>
                  <Text style={styles.miraAISubtitle}>Sempre disponível para te ouvir</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* My Conversations Button - Only for listen mode */}
          {showConversationsButton && !showMiraAI && (
            <Animated.View style={[
              styles.miraAIContainer,
              {
                opacity: miraFadeValue,
                transform: [{ scale: miraScaleValue }]
              }
            ]}>
              <TouchableOpacity 
                style={styles.miraAIButton} 
                onPress={async () => {
                  console.log('=== MY CONVERSATIONS BUTTON CLICKED ===');
                  console.log('showMiraAI:', showMiraAI);
                  console.log('showConversationsButton:', showConversationsButton);
                  console.log('userMode:', userMode);
                  console.log('About to navigate immediately...');
                  
                  // Stop loading and clear states
                  setIsLoading(false);
                  setShowConversationsButton(false);
                  
                  // Navigate immediately to conversations view (cache will handle loading)
                  setView('conversations');
                  
                  // Load conversations in background (will use cache if already loaded)
                  loadUserConversations();
                  
                  console.log('=== END MY CONVERSATIONS BUTTON ===');
                }}
              >
                <View style={styles.miraAIIcon}>
                  <Text style={styles.miraAIEmoji}>💬</Text>
                </View>
                <View style={styles.miraAITextContainer}>
                  <Text style={styles.miraAITitle}>My Conversations</Text>
                  <Text style={styles.miraAISubtitle}>Vê as tuas conversas anteriores</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {/* Cancel Button */}
          <View style={styles.cancelLoadingContainer}>
            <TouchableOpacity style={styles.cancelLoadingButton} onPress={() => {
              setIsLoading(false);
              setShowMiraAI(false);
              setView('onboard');
            }}>
              <Text style={styles.cancelLoadingText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        </SafeAreaView>
        
        {/* Global Talker Notification Overlay - appears on all views */}
        {currentTalkerRequest && (
          <TalkerNotification
            request={currentTalkerRequest}
            onAccept={handleAcceptTalker}
            onDecline={handleDeclineTalker}
            onTimeout={handleNotificationTimeout}
            visible={showTalkerNotification}
          />
        )}
      </>
    );
  }

  if (view === 'mode-selection') {
    return (
      <>
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
          <StatusBar barStyle="dark-content" backgroundColor="#F9F7FC" />
          
          {/* User Profile Button at the top */}
          <View style={styles.topUserButton}>
            <TouchableOpacity 
              style={styles.userProfileButton} 
              onPress={() => setView('profile')}
            >
              <View style={styles.userProfileContent}>
                <Text style={styles.userProfileEmoji}>👤</Text>
                <Text style={styles.userProfileText}>{user?.name || 'Utilizador'}</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <ModeSelectionScreen onModeSelected={handleModeSelected} />
        </SafeAreaView>
        
        {/* Global Talker Notification Overlay - appears on all views */}
        {currentTalkerRequest && (
          <TalkerNotification
            request={currentTalkerRequest}
            onAccept={handleAcceptTalker}
            onDecline={handleDeclineTalker}
            onTimeout={handleNotificationTimeout}
            visible={showTalkerNotification}
          />
        )}
      </>
    );
  }

  if (view === 'onboard') {
    const isTalkMode = userMode === 'talk';
    return (
      <>
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
          <StatusBar barStyle="dark-content" backgroundColor="#fefefe" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            // If we're in a conversation, go back to conversations list
            // Otherwise go to mode selection
            if (currentConversation) {
              setView('conversations');
              // Force reload conversations to show latest data
              loadUserConversations(true);
            } else {
              setView('mode-selection');
            }
          }}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutText}>Sair</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.onboardContainer}>
          <Text style={styles.title}>
            {isTalkMode ? 'Precisas de falar?' : 'Queres ouvir alguém?'}
          </Text>
          <Text style={styles.subtitle}>
            {isTalkMode 
              ? 'Partilha o que tens no coração' 
              : 'Estás aqui para acolher e ouvir'
            }
          </Text>
          {isTalkMode && (
            <>
              <TextInput 
                style={styles.input} 
                placeholder="Sobre o que queres falar?" 
                value={topic} 
                onChangeText={setTopic} 
              />
              <View style={styles.durationContainer}>
                <Text style={styles.durationLabel}>Quanto tempo precisas?</Text>
                <View style={styles.durationOptions}>
                  {['1 min', '15 min', '30 min', '45 min', '1 hora'].map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.durationOption,
                        duration === time && styles.selectedDurationOption
                      ]}
                      onPress={() => setDuration(time)}
                    >
                      <Text style={[
                        styles.durationOptionText,
                        duration === time && styles.selectedDurationOptionText
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
          <TouchableOpacity 
            style={[
              styles.button, 
              userMode === 'talk' && (!topic.trim() || !duration) && styles.buttonDisabled
            ]} 
            onPress={startChat}
            disabled={userMode === 'talk' && (!topic.trim() || !duration)}
          >
            <Text style={styles.buttonText}>
              {userMode === 'talk' ? 'Encontrar alguém para ouvir' : 'Ficar disponível para ouvir'}
            </Text>
          </TouchableOpacity>
        </View>
        </SafeAreaView>
        
        {/* Global Talker Notification Overlay - appears on all views */}
        {currentTalkerRequest && (
          <TalkerNotification
            request={currentTalkerRequest}
            onAccept={handleAcceptTalker}
            onDecline={handleDeclineTalker}
            onTimeout={handleNotificationTimeout}
            visible={showTalkerNotification}
          />
        )}
      </>
    );
  }

  if (view === 'conversations') {
    console.log('=== RENDERING CONVERSATIONS VIEW ===');
    console.log('conversations:', conversations);
    console.log('userMode:', userMode);
    return (
      <>
        <ConversationsListScreen
        conversations={conversations}
        onConversationSelect={handleConversationSelect}
        onBack={() => setView('profile')}
        onNewConversation={handleNewConversation}
        currentUserMode={userMode}
        />
        
        {/* Global Talker Notification Overlay - appears on all views */}
        {currentTalkerRequest && (
          <TalkerNotification
            request={currentTalkerRequest}
            onAccept={handleAcceptTalker}
            onDecline={handleDeclineTalker}
            onTimeout={handleNotificationTimeout}
            visible={showTalkerNotification}
          />
        )}
      </>
    );
  }

  if (view === 'talker-request' && currentTalkerRequest) {
    return (
      <>
        <TalkerRequestScreen
          request={currentTalkerRequest}
          onAccept={handleAcceptTalker}
          onDecline={handleDeclineTalker}
        />
        
        {/* Global Talker Notification Overlay - appears on all views */}
        {currentTalkerRequest && (
          <TalkerNotification
            request={currentTalkerRequest}
            onAccept={handleAcceptTalker}
            onDecline={handleDeclineTalker}
            onTimeout={handleNotificationTimeout}
            visible={showTalkerNotification}
          />
        )}
      </>
    );
  }

  if (view === 'profile') {
    return (
      <>
        <ProfileScreen
          currentMode={userMode}
          onModeChange={handleModeChange}
          onBack={() => setView('conversations')}
        />
        
        {/* Global Talker Notification Overlay - appears on all views */}
        {currentTalkerRequest && (
          <TalkerNotification
            request={currentTalkerRequest}
            onAccept={handleAcceptTalker}
            onDecline={handleDeclineTalker}
            onTimeout={handleNotificationTimeout}
            visible={showTalkerNotification}
          />
        )}
      </>
    );
  }

  return (
    <>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fefefe" />
        <View style={styles.chatHeader}>
        <TouchableOpacity 
          style={styles.backToConversationsButton} 
          onPress={async () => {
            await loadUserConversations();
            setView('conversations');
          }}
        >
          <Text style={styles.backToConversationsText}>←</Text>
        </TouchableOpacity>
        <View style={styles.chatTitleContainer}>
          <Text style={styles.chatTitle}>
            {isSearching 
              ? 'A procurar alguém...' 
              : currentConversation?.partnerName || (userMode === 'talk' ? 'A falar com alguém' : 'Aguardando alguém para ouvir')
            }
          </Text>
          {conversationTimer !== null && currentConversation?.partnerName !== 'Mira AI' && (
            <Text style={[
              styles.timerText,
              conversationTimer <= 60 && styles.timerWarning,
              isConversationExpired && styles.timerExpired
            ]}>
              {isConversationExpired 
                ? 'Conversa terminada' 
                : `${Math.floor(conversationTimer / 60)}:${(conversationTimer % 60).toString().padStart(2, '0')}`
              }
            </Text>
          )}
        </View>
        <View style={styles.placeholder} />
      </View>
      {isSearching ? (
        <View style={styles.searchingContainer}>
          <Text style={styles.searchingIcon}>🔍</Text>
          <Text style={styles.searchingTitle}>A procurar alguém para te ouvir</Text>
          <Text style={styles.searchingSubtitle}>
            Estamos a notificar pessoas disponíveis para ouvir sobre: "{topic}"
          </Text>
          <Text style={styles.searchingDuration}>Duração: {duration}</Text>
          
          <TouchableOpacity style={styles.cancelButton} onPress={cancelSearch}>
            <Text style={styles.cancelButtonText}>Cancelar Procura</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
        >
          <View style={{ flex: 1 }}>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={{ 
                padding: 12, 
                paddingBottom: 20, 
                paddingTop: 20,
                flexGrow: 1
              }}
              onContentSizeChange={() => scrollToBottom()}
              onLayout={() => scrollToBottom()}
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            />
            
            {/* Typing indicator for Mira AI and Partner */}
            {(() => {
              const shouldShowMira = isMiraTyping && currentConversation?.partnerName === 'Mira AI';
              const shouldShowPartner = isPartnerTyping && currentConversation?.partnerName !== 'Mira AI';
              const shouldShow = shouldShowMira || shouldShowPartner;
              console.log('=== TYPING INDICATOR DEBUG ===');
              console.log('isMiraTyping:', isMiraTyping);
              console.log('isPartnerTyping:', isPartnerTyping);
              console.log('currentConversation?.partnerName:', currentConversation?.partnerName);
              console.log('shouldShow typing indicator:', shouldShow);
              console.log('=== END TYPING INDICATOR DEBUG ===');
              return shouldShow;
            })() && (
              <View style={styles.typingContainer}>
                <View style={styles.typingBubble}>
                  <Animated.View style={[styles.typingDot, { opacity: dot1Opacity }]} />
                  <Animated.View style={[styles.typingDot, { opacity: dot2Opacity }]} />
                  <Animated.View style={[styles.typingDot, { opacity: dot3Opacity }]} />
                </View>
              </View>
            )}
          </View>
          
          {/* Input container fixed at bottom */}
          <View style={[
            styles.inputContainer, 
            { 
              paddingBottom: Math.max(insets.bottom, 12),
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#e8ecf0'
            }
          ]}>
            <TextInput
              style={[
                styles.textInput,
                isConversationExpired && styles.textInputDisabled
              ]}
              value={input}
              onChangeText={(text) => {
                if (!isConversationExpired) {
                  setInput(text);
                  handleTyping();
                }
              }}
              placeholder={isConversationExpired ? "Conversa terminada" : "Escreve o que sentes..."}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
              editable={!isConversationExpired}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
      
      </SafeAreaView>
      
      {/* Global Talker Notification Overlay - appears on all views */}
      {currentTalkerRequest && (
        <TalkerNotification
          request={currentTalkerRequest}
          onAccept={handleAcceptTalker}
          onDecline={handleDeclineTalker}
          onTimeout={handleNotificationTimeout}
          visible={showTalkerNotification}
        />
      )}
      
      {/* Rating Modal - appears when conversation expires for talkers */}
      {console.log('=== RATING MODAL RENDER ===', 'showRatingModal:', showRatingModal, 'userMode:', userMode)}
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onRate={handleRating}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#BDE0FE' }, // Sky Blue - Pureza, calma
  topUserButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  userProfileButton: {
    backgroundColor: '#CDB4DB', // Lavender Dream - Espiritualidade, tranquilidade
    borderRadius: 20, // Raio de canto especificado
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 0,
    shadowColor: 'rgba(205,180,219,0.4)', // Sombra suave lavender
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  userProfileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userProfileEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  userProfileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // Texto branco sobre fundo lilás
    lineHeight: 25.6, // Line height 1.6 para sensação de ar
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20, 
    paddingVertical: 10 
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0, // Removendo borda
    backgroundColor: '#BDE0FE', // Sky Blue - Pureza, calma
    shadowColor: 'rgba(0,0,0,0.05)', // Sombra suave
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  backToConversationsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(205,180,219,0.2)', // Lavender Dream com transparência
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(205,180,219,0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  backToConversationsText: {
    fontSize: 20,
    color: '#4A4A4A', // Dark Gray
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
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A4A', // Dark Gray - Estabilidade
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  backButton: { padding: 8 },
  backText: { color: '#6b5bff', fontSize: 16 },
  signOutButton: { padding: 8 },
  signOutText: { color: '#6b5bff', fontSize: 16 },
  onboardContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: '#6b5bff' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 12, marginBottom: 20, fontSize: 16 },
  durationContainer: { marginBottom: 20 },
  durationLabel: { fontSize: 16, color: '#2c3e50', marginBottom: 12, textAlign: 'center', fontWeight: '500' },
  durationOptions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  durationOption: { 
    backgroundColor: '#f8f9ff', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#e8ecf0' 
  },
  selectedDurationOption: { 
    backgroundColor: '#6b5bff', 
    borderColor: '#6b5bff' 
  },
  durationOptionText: { 
    fontSize: 14, 
    color: '#2c3e50', 
    fontWeight: '500' 
  },
  selectedDurationOptionText: { 
    color: '#ffffff' 
  },
  button: { backgroundColor: '#6b5bff', padding: 15, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#bdc3c7', opacity: 0.6 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  messageContainer: { 
    padding: 16, 
    borderRadius: 20, // Cantos muito arredondados
    marginBottom: 12, 
    maxWidth: '80%',
    shadowColor: 'rgba(0,0,0,0.05)', // Sombras suaves
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  userMsg: { 
    backgroundColor: '#CDB4DB', // Lavender Dream - Espiritualidade
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6, // Cantos especiais para bolhas
  },
  listenerMsg: { 
    backgroundColor: '#FFC8DD', // Blush Pink - Carinho, empatia
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6, // Cantos especiais para bolhas
  },
  messageText: { 
    color: '#4A4A4A', // Dark Gray - Estabilidade
    fontSize: 16,
    lineHeight: 24, // Line height 1.5 para legibilidade
    fontWeight: '400',
  },
  timeText: { 
    fontSize: 12, 
    color: '#8A8A8A', // Light Gray
    marginTop: 6, 
    textAlign: 'right',
    fontWeight: '400',
  },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 16, // Espaçamento generoso
    borderTopWidth: 0, // Removendo borda
    backgroundColor: '#BDE0FE', // Sky Blue - Pureza, calma
    position: 'relative',
    zIndex: 1000,
    minHeight: 70,
    shadowColor: 'rgba(0,0,0,0.05)', // Sombra suave
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center'
  },
  textInput: { 
    flex: 1, 
    borderWidth: 0, // Removendo borda
    borderRadius: 24, // Cantos muito arredondados
    paddingHorizontal: 20, // Espaçamento generoso
    paddingVertical: 16,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 48,
    backgroundColor: 'rgba(255,255,255,0.9)', // Branco translúcido
    color: '#4A4A4A', // Dark Gray
    shadowColor: 'rgba(0,0,0,0.05)', // Sombra suave
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  sendButton: { 
    backgroundColor: '#CDB4DB', // Lavender Dream - Espiritualidade
    borderRadius: 24, 
    paddingHorizontal: 20, 
    paddingVertical: 16,
    justifyContent: 'center', 
    marginLeft: 12,
    shadowColor: 'rgba(205,180,219,0.4)', // Sombra suave lavender
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 48,
    minHeight: 48,
  },
  sendButtonText: { 
    color: '#FFFFFF', 
    fontWeight: '600',
    fontSize: 16,
  },
  searchingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40 
  },
  searchingIcon: { 
    fontSize: 64, 
    marginBottom: 20 
  },
  searchingTitle: { 
    fontSize: 24, 
    fontWeight: '600', 
    color: '#2c3e50', 
    marginBottom: 12, 
    textAlign: 'center' 
  },
  searchingSubtitle: { 
    fontSize: 16, 
    color: '#7f8c8d', 
    textAlign: 'center', 
    lineHeight: 24, 
    marginBottom: 20 
  },
  searchingDuration: { 
    fontSize: 14, 
    color: '#6b5bff', 
    fontWeight: '600' 
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 30
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#ff6b9d',
    position: 'relative'
  },
  loadingBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ff6b9d',
    opacity: 0.1
  },
  loadingAnimation: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    position: 'relative'
  },
  spinningRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#ffffff',
    borderRightColor: '#ffffff',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  },
  ringGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  pulsingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute'
  },
  innerGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
  },
  heartContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  heartIcon: {
    fontSize: 24
  },
  particlesContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center'
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff'
  },
  particle1: {
    top: 20,
    left: 50
  },
  particle2: {
    top: 80,
    right: 30
  },
  particle3: {
    bottom: 40,
    left: 30
  },
  loadingTextContainer: {
    alignItems: 'center',
    marginTop: 20
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  loadingSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
    fontWeight: '500'
  },
  miraAIContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center'
  },
  miraAIButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  miraAIIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6b5bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  miraAIEmoji: {
    fontSize: 24
  },
  miraAITextContainer: {
    flex: 1
  },
  miraAITitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4
  },
  miraAISubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500'
  },
  cancelLoadingContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center'
  },
  cancelLoadingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  cancelLoadingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600'
  },
  typingContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'flex-start'
  },
  typingBubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 80
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#999',
    marginHorizontal: 2
  },
  chatTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  timerText: {
    fontSize: 14,
    color: '#8A8A8A', // Light Gray - Acolhimento
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  timerWarning: {
    color: '#FFAFCC' // Rose Petal - Avisos suaves
  },
  timerExpired: {
    color: '#8A8A8A' // Light Gray - Acolhimento
  },
  textInputDisabled: {
    backgroundColor: 'rgba(138,138,138,0.1)', // Light Gray com transparência
    color: '#8A8A8A' // Light Gray
  }
});

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fefefe' }}>
          <Text>Carregando...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <LoginScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <HearMeMobile />
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
