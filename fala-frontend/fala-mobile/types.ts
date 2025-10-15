export interface Message {
  from: 'user' | 'listener';
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  partnerName: string;
  partnerMode: 'talk' | 'listen';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isActive: boolean;
  topic?: string;
  duration?: string;
  messages: Message[];
}

