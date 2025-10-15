// Fala Backend - Node.js + Express + Socket.IO + MongoDB Atlas
// Deployment-ready setup with environment variables

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI; // MongoDB Atlas connection string in .env

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Add your OpenAI API key to .env
});

// --- MongoDB Schemas ---
const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: String,
  role: { type: String, enum: ['talk', 'listen'], default: 'talk' },
  online: { type: Boolean, default: true },
  topics: [String],
  socketId: String,
  searchingForListeners: { type: Boolean, default: false }, // Track if talker is waiting
  searchTopic: String, // Topic they're searching for
  searchDuration: String, // Duration they want
});

const chatSchema = new mongoose.Schema({
  talkerId: String,
  listenerId: String,
  status: { type: String, enum: ['pending', 'active', 'closed', 'expired'], default: 'pending' },
  topic: String,
  duration: String,
  durationMinutes: { type: Number, default: 15 }, // Duration in minutes for timer
  startTime: { type: Date, default: Date.now }, // When conversation actually started
  endTime: Date, // When conversation ended (calculated from startTime + duration)
  isMiraAI: { type: Boolean, default: false }, // Flag to identify Mira AI conversations
  rating: { type: Number, min: 1, max: 5 }, // Rating from 1 to 5 hearts
  ratedBy: String, // User ID who gave the rating
  createdAt: { type: Date, default: Date.now }
});

// User statistics schema for badges
const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  totalConversationTime: { type: Number, default: 0 }, // Total minutes as listener
  totalMessages: { type: Number, default: 0 }, // Total messages sent as listener
  totalRatings: { type: Number, default: 0 }, // Total ratings received
  averageRating: { type: Number, default: 0 }, // Average rating received
  conversationsCount: { type: Number, default: 0 }, // Total conversations as listener
  currentBadge: { type: String, default: 'Pebbie' }, // Current badge level
  currentBadgeEmoji: { type: String, default: '🪶' }, // Current badge emoji
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  chatId: String,
  from: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Chat = mongoose.model('Chat', chatSchema);
const Message = mongoose.model('Message', messageSchema);
const UserStats = mongoose.model('UserStats', userStatsSchema);

// Badge system configuration
const BADGE_LEVELS = [
  { level: 1, name: 'Pebbie', emoji: '🪶', requirements: { time: 0, messages: 0, rating: 0 } },
  { level: 2, name: 'Glowie', emoji: '✨', requirements: { time: 60, messages: 60, rating: 4.2 } },
  { level: 3, name: 'Heartie', emoji: '💌', requirements: { time: 180, messages: 180, rating: 4.4 } },
  { level: 4, name: 'Lumi', emoji: '🌙', requirements: { time: 480, messages: 400, rating: 4.6 } },
  { level: 5, name: 'Seraphie', emoji: '🕊️', requirements: { time: 1080, messages: 850, rating: 4.8 } }
];

// Function to calculate user's badge level
const calculateBadgeLevel = (stats) => {
  let currentLevel = 1;
  
  for (let i = BADGE_LEVELS.length - 1; i >= 0; i--) {
    const badge = BADGE_LEVELS[i];
    if (stats.totalConversationTime >= badge.requirements.time &&
        stats.totalMessages >= badge.requirements.messages &&
        stats.averageRating >= badge.requirements.rating) {
      currentLevel = badge.level;
      break;
    }
  }
  
  const badge = BADGE_LEVELS.find(b => b.level === currentLevel);
  return {
    level: currentLevel,
    name: badge.name,
    emoji: badge.emoji
  };
};

// Function to update user statistics
const updateUserStats = async (userId, statsUpdate) => {
  try {
    let userStats = await UserStats.findOne({ userId });
    
    if (!userStats) {
      userStats = new UserStats({ userId });
    }
    
    // Update statistics
    Object.keys(statsUpdate).forEach(key => {
      if (userStats[key] !== undefined) {
        userStats[key] += statsUpdate[key];
      }
    });
    
    // Recalculate average rating
    if (statsUpdate.totalRatings > 0) {
      // totalRatings is the sum of all ratings, not the count
      userStats.averageRating = userStats.conversationsCount > 0 
        ? userStats.totalRatings / userStats.conversationsCount 
        : 0;
    }
    
    // Calculate new badge level
    const oldBadge = userStats.currentBadge;
    const newBadge = calculateBadgeLevel(userStats);
    userStats.currentBadge = newBadge.name;
    userStats.currentBadgeEmoji = newBadge.emoji;
    userStats.updatedAt = new Date();
    
    // Log badge upgrade
    if (oldBadge !== newBadge.name) {
      console.log('🎉 BADGE UPGRADE!');
      console.log('User:', userId);
      console.log('Old badge:', oldBadge);
      console.log('New badge:', newBadge.name, newBadge.emoji);
      console.log('Stats:', {
        time: userStats.totalConversationTime,
        messages: userStats.totalMessages,
        rating: userStats.averageRating.toFixed(2)
      });
    }
    
    await userStats.save();
    return userStats;
  } catch (error) {
    console.error('Error updating user stats:', error);
    return null;
  }
};

// --- Connect to MongoDB Atlas ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.error(err));

// --- Endpoints ---

// Test endpoint to verify server is running
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Check if conversation has expired
app.get('/api/conversation/:chatId/status', async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    const now = new Date();
    const isExpired = chat.endTime && now > chat.endTime;
    
    if (isExpired && chat.status !== 'expired') {
      // Mark conversation as expired
      chat.status = 'expired';
      await chat.save();
      
      // Mark talker as available again
      await User.findByIdAndUpdate(chat.talkerId, { 
        online: true, // Keep online but available for new conversations
        mode: 'talk' // Reset to talk mode
      });
      
      console.log('Talker marked as available again:', chat.talkerId);
    }

    res.json({
      chatId: chat._id,
      status: chat.status,
      isExpired: isExpired,
      endTime: chat.endTime,
      timeRemaining: chat.endTime ? Math.max(0, chat.endTime - now) : null
    });
  } catch (error) {
    console.error('Error checking conversation status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Expire a conversation manually
app.post('/api/conversation/:chatId/expire', async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    chat.status = 'expired';
    await chat.save();

    // Mark talker as available again
    await User.findByIdAndUpdate(chat.talkerId, { 
      online: true, // Keep online but available for new conversations
      mode: 'talk' // Reset to talk mode
    });
    
    console.log('Talker marked as available again (manual expire):', chat.talkerId);

    res.json({ 
      message: 'Conversa expirada com sucesso',
      chatId: chat._id,
      status: chat.status
    });
  } catch (error) {
    console.error('Error expiring conversation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rate a conversation
app.post('/api/conversation/:chatId/rate', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { rating, userId } = req.body;
    
    console.log('=== RATING CONVERSATION ===');
    console.log('Chat ID:', chatId);
    console.log('Rating:', rating);
    console.log('User ID:', userId);
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    // Update chat with rating
    chat.rating = rating;
    chat.ratedBy = userId;
    await chat.save();

    // Update listener's statistics
    if (chat.listenerId) {
      // Calculate conversation time in minutes
      const conversationTimeMinutes = chat.durationMinutes || 15;
      
      const statsUpdate = {
        totalRatings: rating,
        conversationsCount: 1,
        totalConversationTime: conversationTimeMinutes
      };
      
      await updateUserStats(chat.listenerId, statsUpdate);
      console.log('Listener stats updated for user:', chat.listenerId);
      console.log('Added conversation time:', conversationTimeMinutes, 'minutes');
    }

    console.log('Rating saved successfully');
    res.json({ 
      message: 'Rating salvo com sucesso',
      chatId: chat._id,
      rating: rating
    });
  } catch (error) {
    console.error('Error saving rating:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get user statistics and badge
app.get('/api/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let userStats = await UserStats.findOne({ userId });
    
    if (!userStats) {
      // Create new user stats if doesn't exist
      userStats = new UserStats({ userId });
      await userStats.save();
    }
    
    // Calculate current badge level
    const badge = calculateBadgeLevel(userStats);
    
    res.json({
      userId: userId,
      totalConversationTime: userStats.totalConversationTime,
      totalMessages: userStats.totalMessages,
      totalRatings: userStats.totalRatings,
      averageRating: userStats.averageRating,
      conversationsCount: userStats.conversationsCount,
      currentBadge: badge.name,
      currentBadgeEmoji: badge.emoji,
      badgeLevel: badge.level,
      nextBadge: BADGE_LEVELS.find(b => b.level === badge.level + 1) || null
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Mira AI endpoint for generating emotional responses
app.post('/api/mira-ai', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create conversation context for Mira AI
    const systemPrompt = `Tu és a Mira, uma amiga próxima e empática. A tua personalidade é:

- Falas como uma amiga próxima, natural e curiosa
- Usas linguagem carinhosa mas casual: "querido", "amigo", "querida"
- És empática mas fazes perguntas para entender melhor
- Focas em descobrir o que realmente se passa
- As tuas respostas são curtas (máximo 2-3 frases)
- SEMPRE fazes pelo menos uma pergunta para saber mais
- Usas alguns emojis mas sem exagero
- És especialista em relacionamentos, família, trabalho, amizades
- Fazes perguntas específicas e úteis
- Falas de forma natural, como numa conversa entre amigos
- Sempre ofereces apoio mas queres saber mais detalhes

Exemplos de respostas corretas:
"Querido, sinto muito. O que se passa exatamente? Estou aqui para te ouvir."
"Amigo, isso deve ser difícil. Há quanto tempo te sentes assim?"
"Entendo que te sintas assim. O que te levou a sentir-te desta forma?"

Responde em português europeu.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.from === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 150, // Respostas curtas mas com espaço para perguntas
      temperature: 0.7, // Criativo mas controlado
      presence_penalty: 0.3, // Evita repetição
      frequency_penalty: 0.2 // Linguagem natural
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Calculate typing time based on message length (realistic typing simulation)
    const messageLength = aiResponse.length;
    const wordsPerMinute = 200; // Average typing speed
    const charactersPerMinute = wordsPerMinute * 5; // Average 5 characters per word
    const typingTimeMs = Math.max(1000, (messageLength / charactersPerMinute) * 60 * 1000); // Minimum 1 second
    
    res.json({ 
      response: aiResponse,
      success: true,
      typingTime: Math.round(typingTimeMs) // Time in milliseconds
    });
    
  } catch (error) {
    console.error('Mira AI Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      fallback: 'Sinto muito, querido... estou a ter dificuldades técnicas. Mas sabe que é? Estou aqui para ti, mesmo assim. 💙'
    });
  }
});

// Create Mira AI conversation
app.post('/api/mira-ai/start', async (req, res) => {
  console.log('=== MIRA AI START ENDPOINT CALLED ===');
  console.log('Request body:', req.body);
  try {
    const { userId, topic, duration } = req.body;
    
    console.log('Parsed data:', { userId, topic, duration });
    
    if (!userId) {
      console.log('Error: User ID is required');
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Create a new chat with Mira AI
    console.log('Creating new chat with Mira AI...');
    const chat = new Chat({
      talkerId: userId,
      listenerId: 'mira-ai', // Special ID for Mira AI
      status: 'active',
      topic: topic || 'Conversa com Mira AI',
      duration: duration || 'Ilimitado',
      isMiraAI: true
    });

    console.log('Saving chat to database...');
    await chat.save();
    console.log('Chat saved successfully with ID:', chat._id);

    // Create initial message from Mira AI
    console.log('Creating initial message...');
    const initialMessage = new Message({
      chatId: chat._id,
      from: 'mira-ai',
      text: 'Olá, querido! 💙 Sou a Mira, a tua amiga. Estou aqui para te ouvir e ajudar. Como te sentes hoje? O que se passa?',
      timestamp: new Date()
    });

    await initialMessage.save();
    console.log('Initial message saved successfully');

    console.log('Sending success response...');
    res.json({ 
      success: true, 
      chatId: chat._id,
      message: 'Conversa com Mira AI iniciada com sucesso'
    });
    console.log('=== MIRA AI START ENDPOINT SUCCESS ===');
  } catch (error) {
    console.error('Error creating Mira AI conversation:', error);
    res.status(500).json({ error: 'Failed to create Mira AI conversation' });
  }
});

app.post('/api/start', async (req, res) => {
  const { userName, topic, duration, mode } = req.body;
  
  if (mode === 'talk') {
    // User wants to talk - find listeners
    const listeners = await User.find({ 
      role: 'listen', 
      online: true,
      socketId: { $exists: true, $ne: null }
    });

    if (listeners.length > 0) {
      // Notify all available listeners
      const requestId = Date.now().toString();
      listeners.forEach(listener => {
        io.to(listener.socketId).emit('talkerRequest', {
          userName,
          topic,
          duration,
          requestId: requestId
        });
      });
      
      // Set a timeout to notify the talker if no listener accepts within 5 seconds
      setTimeout(() => {
        // Check if the request is still pending (no listener accepted)
        io.emit('noListenersFound', {
          requestId: requestId,
          message: 'Infelizmente neste momento não está ninguém disponível para te ouvir'
        });
      }, 5000); // 5 seconds
      
      res.json({ 
        status: 'notifying', 
        message: 'A procurar alguém para te ouvir...',
        listenersCount: listeners.length,
        requestId: requestId
      });
    } else {
      res.json({ 
        status: 'no_listeners', 
        message: 'Neste momento não há ninguém disponível para ouvir. Tenta novamente em breve.' 
      });
    }
  } else {
    // User wants to listen - just register as available
    res.json({ 
      status: 'listening', 
      message: 'Estás disponível para ouvir. Aguarda por alguém que precise de falar.' 
    });
  }
});

app.post('/api/accept-talker', async (req, res) => {
  const { requestId, listenerId, talkerData } = req.body;
  
  // Create chat between talker and listener
  const chat = new Chat({ 
    userId: talkerData.userId, 
    listenerId: listenerId, 
    status: 'active',
    topic: talkerData.topic,
    duration: talkerData.duration
  });
  await chat.save();

  // Notify talker that they found a listener
  io.to(talkerData.socketId).emit('listenerFound', { 
    chatId: chat._id, 
    listenerName: talkerData.listenerName 
  });

  res.json({ status: 'matched', chatId: chat._id });
});

app.post('/api/message', async (req, res) => {
  const { chatId, from, text } = req.body;
  const msg = new Message({ chatId, from, text });
  await msg.save();

  const chat = await Chat.findById(chatId);
  if (chat) {
    const targetId = from === 'user' ? chat.listenerId.toString() : chat.userId.toString();
    io.to(targetId).emit('message', msg);
  }

  res.json({ success: true });
});

// Save message in Mira AI conversation
app.post('/api/mira-ai/message', async (req, res) => {
  try {
    const { chatId, from, text } = req.body;
    
    if (!chatId || !from || !text) {
      return res.status(400).json({ error: 'chatId, from, and text are required' });
    }

    // Save the message
    const message = new Message({
      chatId,
      from,
      text,
      timestamp: new Date()
    });

    await message.save();

    res.json({ success: true, message });
  } catch (error) {
    console.error('Error saving Mira AI message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// --- WebSocket ---
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('register', async ({ userId, userName, mode }) => {
    socket.join(userId);
    
    // Find or create user (handle demo user case)
    let user = await User.findOne({ _id: userId });
    if (!user) {
      // Create new user if not found (for demo users)
      user = new User({
        _id: userId,
        name: userName,
        role: mode,
        online: true,
        socketId: socket.id
      });
      await user.save();
    } else {
      // Update existing user
      await User.findByIdAndUpdate(userId, {
        socketId: socket.id,
        role: mode,
        online: true
      });
    }
    
    console.log(`User ${userName} registered as ${mode} with socket ${socket.id}`);
    
    // If user is registering as listener, notify them of any pending talker requests
    if (mode === 'listen') {
      // Check if there are any talkers actively searching for listeners
      const searchingTalkers = await User.find({ 
        role: 'talk', 
        online: true,
        searchingForListeners: true,
        socketId: { $ne: null }
      });
      
      if (searchingTalkers.length > 0) {
        console.log(`Found ${searchingTalkers.length} talkers searching, notifying new listener`);
        
        // Notify the new listener about each searching talker
        searchingTalkers.forEach(talker => {
          socket.emit('talkerRequest', {
            talkerId: talker._id,
            talkerName: talker.name,
            topic: talker.searchTopic,
            duration: talker.searchDuration,
            timestamp: new Date().toISOString()
          });
          console.log(`Notified new listener about talker ${talker.name} (${talker._id})`);
        });
      }
    }
  });

  socket.on('talkerRequest', async ({ userId, userName, topic, duration }) => {
    try {
      console.log(`Talker request from ${userName} (${userId}): ${topic} for ${duration}`);
      
      // Mark talker as searching for listeners
      await User.findByIdAndUpdate(userId, { 
        searchingForListeners: true,
        searchTopic: topic,
        searchDuration: duration
      });
      
      // Find all online listeners
      const listeners = await User.find({ 
        role: 'listen', 
        online: true,
        socketId: { $ne: null },
        _id: { $ne: userId } // Don't notify the talker themselves
      });
      
      console.log(`Found ${listeners.length} online listeners to notify`);
      
      // Notify all listeners about the talker request
      listeners.forEach(listener => {
        const listenerSocket = io.sockets.sockets.get(listener.socketId);
        if (listenerSocket) {
          listenerSocket.emit('talkerRequest', {
            talkerId: userId,
            talkerName: userName,
            topic: topic,
            duration: duration,
            timestamp: new Date().toISOString()
          });
          console.log(`Notified listener ${listener.name} (${listener._id}) about talker request`);
        }
      });
      
      // Confirm to the talker that listeners have been notified
      socket.emit('listenersNotified', {
        listenersCount: listeners.length,
        message: listeners.length > 0 
          ? `${listeners.length} pessoa(s) disponível(is) foram notificada(s)`
          : 'Nenhum ouvinte disponível no momento. Aguardando...'
      });
      
    } catch (error) {
      console.error('Error handling talker request:', error);
      socket.emit('error', { message: 'Erro ao notificar ouvintes' });
    }
  });

  socket.on('acceptTalker', async ({ requestId, listenerId, talkerData }) => {
    try {
      console.log('=== ACCEPTING TALKER REQUEST ===');
      console.log('RequestId:', requestId);
      console.log('ListenerId:', listenerId);
      console.log('TalkerData:', talkerData);
      
      // Find the talker's socket by userId
      const talker = await User.findOne({ _id: talkerData.userId, online: true });
      if (!talker || !talker.socketId) {
        console.error('Talker not found or offline:', talkerData.userId);
        socket.emit('error', { message: 'Falante não encontrado ou offline' });
        return;
      }

      // Check if talker already has an active conversation (with race condition protection)
      const existingChat = await Chat.findOne({ 
        talkerId: talkerData.userId, 
        status: 'active' 
      });
      
      if (existingChat) {
        console.log('Talker already has an active conversation:', existingChat._id);
        console.log('Existing chat listener:', existingChat.listenerId);
        console.log('Current listener trying to accept:', listenerId);
        
        // Only block if it's a different listener
        if (existingChat.listenerId.toString() !== listenerId.toString()) {
          socket.emit('talkerAlreadyOccupied', {
            message: `${talker.name} já está a ser ouvido por alguém`,
            talkerName: talker.name
          });
          return;
        } else {
          console.log('Same listener trying to accept again - allowing (might be duplicate request)');
        }
      }

      // Create chat between talker and listener
      console.log('Creating chat with data:', {
        talkerId: talkerData.userId,
        listenerId: listenerId,
        topic: talkerData.topic,
        duration: talkerData.duration
      });
      
      // Parse duration to minutes
      let durationMinutes = 15; // default
      if (talkerData.duration) {
        if (talkerData.duration.includes('1 min')) {
          durationMinutes = 1;
        } else if (talkerData.duration.includes('15 min')) {
          durationMinutes = 15;
        } else if (talkerData.duration.includes('30 min')) {
          durationMinutes = 30;
        } else if (talkerData.duration.includes('45 min')) {
          durationMinutes = 45;
        } else if (talkerData.duration.includes('1 hora')) {
          durationMinutes = 60;
        } else {
          // Fallback: try to parse as number
          durationMinutes = parseInt(talkerData.duration) || 15;
        }
      }
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + (durationMinutes * 60 * 1000));

      // Double-check before creating chat (race condition protection)
      const finalCheck = await Chat.findOne({ 
        talkerId: talkerData.userId, 
        status: 'active' 
      });
      
      if (finalCheck && finalCheck.listenerId.toString() !== listenerId.toString()) {
        console.log('Race condition detected - another listener got there first');
        socket.emit('talkerAlreadyOccupied', {
          message: `${talker.name} já está a ser ouvido por alguém`,
          talkerName: talker.name
        });
        return;
      }

      const chat = new Chat({ 
        talkerId: talkerData.userId, 
        listenerId: listenerId, 
        status: 'active',
        topic: talkerData.topic,
        duration: talkerData.duration,
        durationMinutes: durationMinutes,
        startTime: startTime,
        endTime: endTime
      });
      await chat.save();

      // Clear talker's searching state
      await User.findByIdAndUpdate(talkerData.userId, {
        searchingForListeners: false,
        searchTopic: null,
        searchDuration: null
      });

      console.log('Chat created:', chat._id);

      // Notify talker that they found a listener
      const talkerSocket = io.sockets.sockets.get(talker.socketId);
      if (talkerSocket) {
        talkerSocket.emit('listenerFound', { 
          chatId: chat._id, 
          listenerName: talkerData.listenerName 
        });
        console.log('Notified talker:', talkerData.userId);
      }

      // Notify listener that chat is ready
      socket.emit('chatReady', { 
        chatId: chat._id,
        talkerName: talker.name,
        topic: talkerData.topic,
        duration: talkerData.duration
      });
      console.log('Notified listener:', listenerId);
      console.log('Listener socket ID:', socket.id);
      console.log('ChatReady event sent with chatId:', chat._id);

      // Notify all other listeners that this talker is now being listened to
      const allListeners = await User.find({ 
        mode: 'listen', 
        online: true,
        _id: { $ne: listenerId } // Exclude the listener who just accepted
      });
      
      console.log('Notifying other listeners that talker is occupied:', allListeners.length);
      
      allListeners.forEach(async (otherListener) => {
        if (otherListener.socketId) {
          const otherListenerSocket = io.sockets.sockets.get(otherListener.socketId);
          if (otherListenerSocket) {
            otherListenerSocket.emit('talkerOccupied', {
              talkerName: talker.name,
              topic: talkerData.topic,
              message: `${talker.name} já está a ser ouvido por alguém`
            });
            console.log('Notified other listener:', otherListener._id, 'that talker is occupied');
          }
        }
      });
      
    } catch (error) {
      console.error('Error accepting talker:', error);
      socket.emit('error', { message: 'Erro ao aceitar a conversa' });
    }
  });

  socket.on('message', async (msg) => {
    console.log('=== MESSAGE RECEIVED ===');
    console.log('Message:', msg);
    console.log('Chat ID:', msg.chatId);
    console.log('From:', msg.from);
    console.log('Text:', msg.text);
    console.log('=== END MESSAGE RECEIVED ===');
    
    const chat = await Chat.findById(msg.chatId);
    if (!chat) {
      console.error('Chat not found:', msg.chatId);
      socket.emit('error', { message: 'Conversa não encontrada' });
      return;
    }

    // Check if conversation has expired
    const now = new Date();
    const isExpired = chat.endTime && now > chat.endTime;
    
    if (isExpired || chat.status === 'expired') {
      console.log('Conversation expired, blocking message');
      socket.emit('conversationExpired', { 
        message: 'Esta conversa já terminou. Não é possível enviar mais mensagens.',
        chatId: chat._id 
      });
      return;
    }

    const message = new Message(msg);
    await message.save();

    // Update listener's message count if message is from listener
    if (chat && chat.listenerId) {
      const sender = await User.findOne({ socketId: socket.id });
      if (sender && sender._id && sender._id.toString() === chat.listenerId.toString()) {
        // This message is from the listener, update their stats
        await updateUserStats(chat.listenerId, { totalMessages: 1 });
        console.log('Listener message count updated for user:', chat.listenerId);
      }
    }

    if (chat && chat.talkerId && chat.listenerId) {
      console.log('Chat found:', chat._id);
      console.log('Talker ID:', chat.talkerId);
      console.log('Listener ID:', chat.listenerId);
      
      // Find the sender's user ID from the socket
      const sender = await User.findOne({ socketId: socket.id });
      if (sender && sender._id) {
        console.log('Sender found:', sender._id, sender.name);
        
        // Determine the recipient based on who sent the message
        const recipientId = sender._id.toString() === chat.talkerId.toString() 
          ? chat.listenerId.toString() 
          : chat.talkerId.toString();
        
        console.log('Recipient ID:', recipientId);
        
        // Find the recipient's socket
        const recipient = await User.findById(recipientId);
        if (recipient && recipient.socketId) {
          console.log('Recipient socket found:', recipient.socketId);
          io.to(recipient.socketId).emit('message', {
            from: 'partner',
            text: msg.text,
            time: msg.timestamp || new Date().toISOString()
          });
          console.log('Message sent to recipient');
        } else {
          console.log('Recipient not found or offline');
        }
      } else {
        console.log('Sender not found or invalid');
      }
    } else {
      console.log('Chat not found or missing talkerId/listenerId');
      console.log('Chat object:', chat);
    }
  });

  socket.on('typing', async (data) => {
    console.log('=== TYPING EVENT ===');
    console.log('Chat ID:', data.chatId);
    console.log('Is Typing:', data.isTyping);
    console.log('=== END TYPING EVENT ===');
    
    const chat = await Chat.findById(data.chatId);
    if (chat && chat.talkerId && chat.listenerId) {
      // Find the sender's user ID from the socket
      const sender = await User.findOne({ socketId: socket.id });
      if (sender && sender._id) {
        // Determine the recipient based on who is typing
        const recipientId = sender._id.toString() === chat.talkerId.toString() 
          ? chat.listenerId.toString() 
          : chat.talkerId.toString();
        
        // Find the recipient's socket and send typing event
        const recipient = await User.findById(recipientId);
        if (recipient && recipient.socketId) {
          io.to(recipient.socketId).emit('partnerTyping', {
            isTyping: data.isTyping
          });
          console.log('Typing event sent to recipient:', recipientId);
        }
      }
    }
  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    
    // Mark user as offline and clear searching state
    await User.findOneAndUpdate(
      { socketId: socket.id },
      { 
        online: false, 
        socketId: null,
        searchingForListeners: false,
        searchTopic: null,
        searchDuration: null
      }
    );
  });
});

// Get available listeners
app.get('/api/listeners/available', async (req, res) => {
  try {
    const listeners = await User.find({ 
      role: 'listen', 
      online: true,
      socketId: { $ne: null }
    }).select('_id name');
    
    res.json({ 
      success: true, 
      listeners: listeners,
      count: listeners.length 
    });
  } catch (error) {
    console.error('Error fetching available listeners:', error);
    res.status(500).json({ error: 'Failed to fetch listeners' });
  }
});

// Get user conversations
app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find all chats where user is either the talker or listener
    const chats = await Chat.find({
      $or: [
        { talkerId: userId },
        { listenerId: userId }
      ]
    }).sort({ createdAt: -1 }); // Most recent first
    
    // Transform chats to conversation format
    const conversations = await Promise.all(chats.map(async (chat) => {
      // Get partner info
      let partnerName = 'Unknown';
      let partnerMode = 'listen';
      
      if (chat.isMiraAI) {
        // This is a Mira AI conversation
        partnerName = 'Mira AI';
        partnerMode = 'listen';
      } else if (chat.talkerId === userId) {
        // User is the talker, partner is the listener
        const listener = await User.findById(chat.listenerId);
        partnerName = listener ? listener.name : 'Listener';
        partnerMode = 'listen';
      } else {
        // User is the listener, partner is the talker
        const talker = await User.findById(chat.talkerId);
        partnerName = talker ? talker.name : 'Talker';
        partnerMode = 'talk';
      }
      
      // Get last message
      const lastMessage = await Message.findOne({ chatId: chat._id })
        .sort({ createdAt: -1 });
      
      // Get all messages for this conversation
      const allMessages = await Message.find({ chatId: chat._id })
        .sort({ createdAt: 1 }); // Oldest first
      
      // Transform messages to frontend format
      const transformedMessages = allMessages.map(msg => ({
        from: msg.from === 'mira-ai' ? 'listener' : msg.from,
        text: msg.text,
        time: msg.timestamp 
          ? msg.timestamp.toISOString() 
          : (msg.createdAt ? msg.createdAt.toISOString() : new Date().toISOString())
      }));
      
      return {
        id: chat._id,
        partnerName,
        partnerMode,
        lastMessage: lastMessage ? lastMessage.text : 'No messages yet',
        lastMessageTime: lastMessage && lastMessage.createdAt 
          ? lastMessage.createdAt.toISOString() 
          : (chat.createdAt ? chat.createdAt.toISOString() : new Date().toISOString()),
        unreadCount: 0, // TODO: Implement unread count
        isActive: false,
        topic: chat.topic || 'General',
        duration: chat.duration || 'Unknown',
        messages: transformedMessages
      };
    }));
    
    res.json({ conversations, success: true });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Function to check for expired conversations and mark talkers as available
const checkExpiredConversations = async () => {
  try {
    const now = new Date();
    const expiredChats = await Chat.find({
      status: 'active',
      endTime: { $lt: now }
    });

    for (const chat of expiredChats) {
      // Mark conversation as expired
      chat.status = 'expired';
      await chat.save();

      // Mark talker as available again
      await User.findByIdAndUpdate(chat.talkerId, { 
        online: true, // Keep online but available for new conversations
        mode: 'talk' // Reset to talk mode
      });
      
      console.log('Expired conversation found and talker marked as available:', chat.talkerId);
    }

    if (expiredChats.length > 0) {
      console.log(`Marked ${expiredChats.length} talkers as available after conversation expiry`);
    }
  } catch (error) {
    console.error('Error checking expired conversations:', error);
  }
};

// Check for expired conversations every 30 seconds
setInterval(checkExpiredConversations, 30000);

server.listen(PORT, () => {
  console.log(`HearMe backend running on port ${PORT}`);
  console.log('Expired conversation checker started (every 30 seconds)');
});

/*
Deployment Guide:

1. MongoDB Atlas:
   - Create cluster and database "fala"
   - Add IP whitelist and get connection string
   - Set .env variable: MONGO_URI=<your_atlas_connection>

2. Backend hosting (Render / Vercel / Railway):
   - Push backend code to GitHub
   - Connect repository to chosen platform
   - Set environment variables (MONGO_URI, PORT)
   - Deploy

3. Mobile App (React Native / Expo):
   - Update SOCKET_URL and API_URL with backend deployed URL
   - Run: expo start (test on device via QR code)

4. WebSocket & Endpoints ready for real-time MVP
*/
