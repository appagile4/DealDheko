export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  isRead?: boolean;
  attachments?: string[];
  messageType?: "text" | "image" | "location";
  createdAt?: string;
}

export interface ChatConversation {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
  productSlug?: string;
  productLocation?: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerPhone?: string;
  sellerVerified?: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages?: ChatMessage[];
  updatedAt?: string;
}
