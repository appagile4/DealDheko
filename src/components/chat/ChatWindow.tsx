"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { ChatMessage, ChatConversation } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useMarketplace } from "@/context/MarketplaceContext";
import {
  Send,
  Sparkles,
  ShieldCheck,
  Phone,
  CheckCircle2,
  ExternalLink,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  ArrowLeft,
  X,
  Maximize2,
} from "lucide-react";

interface ChatWindowProps {
  product?: Product;
  conversationId?: string;
  initialConversation?: any;
  onClose?: () => void;
  onBack?: () => void;
  onNewMessageSent?: (convId: string, lastMsg: string) => void;
}

export function ChatWindow({
  product: propProduct,
  conversationId: propConversationId,
  initialConversation,
  onClose,
  onBack,
  onNewMessageSent,
}: ChatWindowProps) {
  const { user, openAuthModal } = useMarketplace();

  const [activeConvId, setActiveConvId] = useState<string | null>(
    propConversationId || initialConversation?._id || null
  );
  const [partner, setPartner] = useState<{
    id: string;
    name: string;
    avatar: string;
    phone?: string;
    isVerified?: boolean;
    city?: string;
  }>({
    id: propProduct?.seller?.id || initialConversation?.participants?.find((p: any) => p._id !== user?.id)?._id || "",
    name: propProduct?.seller?.name || initialConversation?.participants?.find((p: any) => p._id !== user?.id)?.name || "Seller",
    avatar: propProduct?.seller?.avatar || initialConversation?.participants?.find((p: any) => p._id !== user?.id)?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    phone: propProduct?.seller?.phone,
    isVerified: propProduct?.seller?.verified,
  });

  const [adInfo, setAdInfo] = useState<{
    id?: string;
    title: string;
    price: number;
    image: string;
    location?: string;
    slug?: string;
  }>({
    id: propProduct?.id || initialConversation?.advertisement?._id,
    title: propProduct?.title || initialConversation?.advertisement?.title || "Classified Item",
    price: propProduct?.price || initialConversation?.advertisement?.price || 0,
    image: propProduct?.images?.[0] || initialConversation?.advertisement?.images?.[0]?.url || "",
    location: propProduct?.location?.city || initialConversation?.advertisement?.location?.city || "Nepal",
    slug: propProduct?.slug || initialConversation?.advertisement?.slug,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showPhoneInfo, setShowPhoneInfo] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 1. Initialize or load conversation & message history
  useEffect(() => {
    let isMounted = true;

    async function loadOrCreate() {
      if (!user) return;
      setIsLoadingMessages(true);
      setChatError(null);

      try {
        let convId = activeConvId;

        // If no convId but we have a product ad, get or create conversation
        if (!convId && propProduct?.id) {
          const res = await api.post("/chat/conversations", {
            advertisementId: propProduct.id,
            sellerId: propProduct.seller.id,
          });

          if (!isMounted) return;

          if (res.data?.conversation?._id) {
            convId = res.data.conversation._id;
            setActiveConvId(convId);

            // Populate partner from conversation participants
            const foundPartner = res.data.conversation.participants?.find(
              (p: any) => p._id !== user.id && p._id !== (user as any)._id
            );
            if (foundPartner) {
              setPartner({
                id: foundPartner._id,
                name: foundPartner.name,
                avatar: foundPartner.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
                phone: foundPartner.phone,
                isVerified: foundPartner.isVerified,
                city: foundPartner.city,
              });
            }

            if (res.data.conversation.advertisement) {
              const ad = res.data.conversation.advertisement;
              setAdInfo({
                id: ad._id,
                title: ad.title,
                price: ad.price,
                image: ad.images?.[0]?.url || ad.images?.[0] || "",
                location: ad.location?.city || "Nepal",
                slug: ad.slug,
              });
            }

            if (res.data.messages && res.data.messages.length > 0) {
              const mapped: ChatMessage[] = res.data.messages.map((m: any) => ({
                id: m._id || m.id,
                senderId: m.sender?._id || m.sender,
                senderName: m.sender?.name || "User",
                senderAvatar: m.sender?.avatar,
                text: m.message || m.text || "",
                timestamp: new Date(m.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                isMe: (m.sender?._id || m.sender) === user.id || (m.sender?._id || m.sender) === (user as any)._id,
                isRead: m.isRead,
                createdAt: m.createdAt,
              }));
              setMessages(mapped);
            }
          }
        } else if (convId) {
          // Load messages for existing conversation
          const res = await api.get(`/chat/conversations/${convId}/messages`);
          if (!isMounted) return;

          if (res.data?.messages) {
            const mapped: ChatMessage[] = res.data.messages.map((m: any) => ({
              id: m._id || m.id,
              senderId: m.sender?._id || m.sender,
              senderName: m.sender?.name || "User",
              senderAvatar: m.sender?.avatar,
              text: m.message || m.text || "",
              timestamp: new Date(m.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isMe: (m.sender?._id || m.sender) === user.id || (m.sender?._id || m.sender) === (user as any)._id,
              isRead: m.isRead,
              createdAt: m.createdAt,
            }));
            setMessages(mapped);
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Chat init error:", err);
        setChatError(err.response?.data?.message || "Failed to load chat history.");
      } finally {
        if (isMounted) setIsLoadingMessages(false);
      }
    }

    loadOrCreate();

    return () => {
      isMounted = false;
    };
  }, [propProduct?.id, propProduct?.seller?.id, propConversationId, user]);

  // 2. Set up Socket.IO listeners and join conversation room
  useEffect(() => {
    if (!activeConvId) return;

    const socket = getSocket();
    const token = typeof window !== "undefined" ? localStorage.getItem("dealdoko_token") || "" : "";

    // Join room
    socket.emit("chat:join", { conversationId: activeConvId, token });

    // Mark conversation read on join
    socket.emit("chat:read", { conversationId: activeConvId, token });

    // Check partner online status
    if (partner.id) {
      socket.emit("user:check_online", { userId: partner.id }, (res: any) => {
        if (res?.isOnline !== undefined) setIsPartnerOnline(res.isOnline);
      });
    }

    const handleNewMessage = (msg: any) => {
      if (msg.conversation && msg.conversation.toString() !== activeConvId.toString()) {
        return;
      }

      const senderId = msg.sender?._id || msg.sender;
      const isMe = senderId === user?.id || senderId === (user as any)?._id;

      const newMsg: ChatMessage = {
        id: msg._id || msg.id || `m-${Date.now()}`,
        senderId,
        senderName: msg.sender?.name || "User",
        senderAvatar: msg.sender?.avatar,
        text: msg.message || msg.text || "",
        timestamp: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe,
        isRead: msg.isRead || false,
        createdAt: msg.createdAt,
      };

      setMessages((prev) => {
        // avoid duplicates
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      // If partner sent it while we are in this window, mark as read
      if (!isMe) {
        socket.emit("chat:read", { conversationId: activeConvId, token });
        setIsPartnerTyping(false);
      }
    };

    const handleMessagesRead = (data: { conversationId: string; readerId: string }) => {
      if (data.conversationId === activeConvId) {
        setMessages((prev) =>
          prev.map((m) => (m.isMe ? { ...m, isRead: true } : m))
        );
      }
    };

    const handleTypingUpdate = (data: { conversationId: string; isTyping: boolean; userId: string }) => {
      if (data.conversationId === activeConvId && data.userId !== user?.id) {
        setIsPartnerTyping(data.isTyping);
      }
    };

    const handleOnlineStatus = (data: { userId: string; isOnline: boolean }) => {
      if (data.userId === partner.id) {
        setIsPartnerOnline(data.isOnline);
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("messages:read", handleMessagesRead);
    socket.on("typing:update", handleTypingUpdate);
    socket.on("user:online_status", handleOnlineStatus);

    return () => {
      socket.emit("chat:leave", { conversationId: activeConvId });
      socket.off("message:new", handleNewMessage);
      socket.off("messages:read", handleMessagesRead);
      socket.off("typing:update", handleTypingUpdate);
      socket.off("user:online_status", handleOnlineStatus);
    };
  }, [activeConvId, partner.id, user]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isPartnerTyping]);

  // 3. Handle typing notification emit
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (!activeConvId) return;
    const socket = getSocket();

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing:start", { conversationId: activeConvId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typing:stop", { conversationId: activeConvId });
    }, 1500);
  };

  // 4. Send Message via Socket.IO with REST Fallback
  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride || inputText).trim();
    if (!textToSend) return;

    if (!user) {
      openAuthModal();
      return;
    }

    if (!textOverride) {
      setInputText("");
    }

    // Clear typing status immediately
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    if (activeConvId) {
      getSocket().emit("typing:stop", { conversationId: activeConvId });
    }

    // Optimistic UI message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      senderId: user.id || (user as any)._id,
      senderName: user.name,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
      isRead: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    if (onNewMessageSent && activeConvId) {
      onNewMessageSent(activeConvId, textToSend);
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("dealdoko_token") || "" : "";

    try {
      if (activeConvId) {
        const socket = getSocket();
        socket.emit("message:send", {
          conversationId: activeConvId,
          text: textToSend,
          token,
        });
      } else if (propProduct?.id) {
        // Fallback: initiate conversation via REST
        const res = await api.post("/chat/conversations", {
          advertisementId: propProduct.id,
          sellerId: propProduct.seller.id,
        });

        if (res.data?.conversation?._id) {
          const newConvId = res.data.conversation._id;
          setActiveConvId(newConvId);

          // Now send message via REST
          await api.post(`/chat/conversations/${newConvId}/messages`, {
            text: textToSend,
          });

          const socket = getSocket();
          socket.emit("chat:join", { conversationId: newConvId, token });
        }
      }
    } catch (err: any) {
      console.error("Failed to send message:", err);
      // Fallback REST call if socket failed
      if (activeConvId) {
        try {
          await api.post(`/chat/conversations/${activeConvId}/messages`, {
            text: textToSend,
          });
        } catch (restErr: any) {
          setChatError("Could not deliver message. Please check connection.");
        }
      }
    }
  };

  const QUICK_REPLIES = [
    "Is this still available?",
    "What is your final price?",
    "Can I inspect it today in person?",
    "Do you have original bill & warranty?",
  ];

  const EMOJI_LIST = ["😊", "👍", "🙏", "🤝", "🔥", "👌", "🚗", "📱", "🏠", "💯", "📍", "💰"];

  return (
    <div className="flex flex-col h-full w-full bg-[#EFEAE2] relative overflow-hidden font-sans">
      {/* 1. WHATSAPP STYLE TOP HEADER */}
      <div className="bg-[#F0F2F5] px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-300/80 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-200"
              title="Back to conversation list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Partner Avatar with Online Dot */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-slate-200 bg-white">
              <Image
                src={partner.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                alt={partner.name}
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            </div>
            {isPartnerOnline && (
              <span
                className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-white rounded-full"
                title="Online now"
              />
            )}
          </div>

          {/* Name & Status */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {partner.name}
              </h3>
              {partner.isVerified && (
                <span title="Verified Seller">
                  <CheckCircle2 className="w-4 h-4 text-[#0047BA] shrink-0" />
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs truncate font-medium">
              {isPartnerTyping ? (
                <span className="text-[#00A884] font-semibold animate-pulse">typing...</span>
              ) : isPartnerOnline ? (
                <span className="text-[#00A884]">online</span>
              ) : (
                <span className="text-slate-500">
                  {partner.city ? `Seller in ${partner.city}` : "Available on DealDoko"}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {partner.phone && (
            <button
              onClick={() => setShowPhoneInfo(!showPhoneInfo)}
              className="p-2 text-slate-600 hover:text-[#0047BA] hover:bg-slate-200/70 rounded-full transition-colors"
              title="Show Phone Number"
            >
              <Phone className="w-4 h-4" />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-full transition-colors"
              title="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Phone popup banner if toggled */}
      {showPhoneInfo && partner.phone && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900 animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-amber-700" />
            <span>
              Contact: <strong>{partner.phone}</strong>
            </span>
          </div>
          <a
            href={`tel:${partner.phone}`}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px]"
          >
            Call Now
          </a>
        </div>
      )}

      {/* 2. PRODUCT CONTEXT BANNER (PINNED TO TOP OF CHAT) */}
      {adInfo.title && (
        <div className="bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-3.5 py-2.5 flex items-center justify-between shadow-2xs z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {adInfo.image ? (
              <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                <Image
                  src={adInfo.image}
                  alt={adInfo.title}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Negotiating Item
              </span>
              <p className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-sm">
                {adInfo.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-extrabold text-[#0047BA]">
                  {formatPrice(adInfo.price)}
                </span>
                <span className="text-[10px] text-slate-400">• {adInfo.location}</span>
              </div>
            </div>
          </div>

          {adInfo.slug && (
            <Link
              href={`/product/${adInfo.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0047BA] hover:text-[#FF6A00] bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 shrink-0 transition-colors"
            >
              <span>View Ad</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      {/* 3. WHATSAPP CHAT STREAM AREA */}
      <div
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 relative"
        style={{
          backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
          backgroundColor: "#EFEAE2",
        }}
      >
        {/* Security & Safety WhatsApp Pill */}
        <div className="flex justify-center my-2">
          <div className="bg-[#FFF9C4]/90 text-amber-900 border border-amber-200/80 rounded-lg px-3.5 py-1.5 text-[11px] text-center max-w-md shadow-2xs flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>
              🔒 Messages are private &amp; securely exchanged between buyer and seller. Keep payments inside DealDoko!
            </span>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoadingMessages && (
          <div className="flex justify-center py-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200 text-xs text-slate-600 shadow-2xs">
              <span className="w-3.5 h-3.5 border-2 border-[#00A884] border-t-transparent rounded-full animate-spin" />
              <span>Loading messages...</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {chatError && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 text-center">
            {chatError}
          </div>
        )}

        {/* Conversation Message History */}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Partner Typing Bubble Animation */}
        {isPartnerTyping && (
          <div className="flex justify-start my-1 px-2">
            <div className="bg-white rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-[0_1px_0.5px_rgba(11,20,26,0.12)] border border-slate-100/80 flex items-center gap-1.5">
              <span className="text-[12px] text-slate-500 font-medium">{partner.name} is typing</span>
              <div className="flex items-center gap-1 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. QUICK OFFER / NEGOTIATION CHIPS */}
      <div className="bg-[#F0F2F5]/95 border-t border-slate-200/90 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0 flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-[#FF6A00]" />
          Quick:
        </span>
        {QUICK_REPLIES.map((reply, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(reply)}
            className="text-xs bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full border border-slate-300/80 shrink-0 transition-colors shadow-2xs hover:border-slate-400 font-medium"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Emoji Picker Row if toggled */}
      {showEmojis && (
        <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center gap-2 overflow-x-auto shrink-0 shadow-xs">
          {EMOJI_LIST.map((emoji, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText((prev) => prev + emoji);
                setShowEmojis(false);
              }}
              className="text-lg hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* 5. WHATSAPP INPUT TOOLBAR */}
      <div className="bg-[#F0F2F5] p-2.5 sm:p-3 border-t border-slate-300/80 flex items-center gap-2 shrink-0">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 rounded-full transition-colors shrink-0"
          title="Add Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Input Text Field */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="w-full bg-white text-slate-900 text-sm rounded-full py-2.5 px-4 outline-none border border-transparent focus:border-slate-300 placeholder:text-slate-400 shadow-2xs transition-all"
          />
        </div>

        {/* WhatsApp Round Send Button */}
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all shadow-xs ${
            inputText.trim()
              ? "bg-[#00A884] hover:bg-[#008f6f] text-white cursor-pointer transform active:scale-95"
              : "bg-slate-300 text-slate-500 cursor-not-allowed opacity-60"
          }`}
          title="Send message"
        >
          <Send className="w-4 h-4 translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;