"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useMarketplace } from "@/context/MarketplaceContext";
import {
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  Search,
  Check,
  CheckCheck,
  RefreshCw,
  ShoppingBag,
  Lock,
  Smile,
  BadgeCheck,
} from "lucide-react";

interface BackendConversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    avatar?: string;
    isVerified?: boolean;
    city?: string;
    phone?: string;
  }>;
  advertisement?: {
    _id: string;
    title: string;
    slug?: string;
    price: number;
    images?: Array<{ url: string } | string>;
    location?: { city?: string; area?: string };
    status?: string;
  };
  lastMessage?: string;
  lastMessageSender?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  updatedAt?: string;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, openAuthModal } = useMarketplace();

  const queryConvId = searchParams.get("conversationId");
  const queryAdId = searchParams.get("adId");
  const querySellerId = searchParams.get("sellerId");

  const [conversations, setConversations] = useState<BackendConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(queryConvId);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Fetch real conversations from backend
  const fetchConversations = async (showLoadingSpinner = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    if (showLoadingSpinner) setIsLoading(true);
    setIsRefreshing(true);

    try {
      const res = await api.get("/chat/conversations");
      if (res.data?.success && Array.isArray(res.data.conversations)) {
        const convList: BackendConversation[] = res.data.conversations;
        setConversations(convList);

        // If URL specified queryConvId and it exists, select it
        if (queryConvId && convList.some((c) => c._id === queryConvId)) {
          setSelectedConvId(queryConvId);
          setShowMobileChat(true);
        } else if (!selectedConvId && convList.length > 0) {
          // Default to first conversation on desktop
          setSelectedConvId(convList[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // If query params has adId and sellerId, initiate/find conversation
  useEffect(() => {
    async function initAdConversation() {
      if (!user || !queryAdId) return;
      try {
        const res = await api.post("/chat/conversations", {
          advertisementId: queryAdId,
          sellerId: querySellerId || undefined,
        });

        if (res.data?.conversation?._id) {
          const newId = res.data.conversation._id;
          setSelectedConvId(newId);
          setShowMobileChat(true);
          fetchConversations();
        }
      } catch (err) {
        console.error("Failed to initiate conversation from ad:", err);
      }
    }

    initAdConversation();
  }, [queryAdId, querySellerId, user]);

  useEffect(() => {
    fetchConversations(true);
  }, [user]);

  // Real-time Socket.IO listeners for new conversations / incoming message updates
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const handleNewMessageAlert = (data: {
      conversationId: string;
      message: any;
      senderName?: string;
    }) => {
      setConversations((prev) => {
        const existingIdx = prev.findIndex((c) => c._id === data.conversationId);
        if (existingIdx !== -1) {
          const updated = [...prev];
          const target = { ...updated[existingIdx] };
          target.lastMessage = data.message.message || data.message.text || target.lastMessage;
          target.lastMessageAt = data.message.createdAt || new Date().toISOString();
          target.lastMessageSender = data.message.sender?._id || data.message.sender;

          // If this is not currently open, increment unread count
          if (selectedConvId !== data.conversationId) {
            target.unreadCount = (target.unreadCount || 0) + 1;
          }

          updated.splice(existingIdx, 1);
          return [target, ...updated];
        } else {
          // If a new conversation was created elsewhere, re-fetch
          fetchConversations();
          return prev;
        }
      });
    };

    const handleMessagesRead = (data: { conversationId: string; readerId: string }) => {
      // Clear unread badge if we are the reader
      if (data.readerId === user.id) {
        setConversations((prev) =>
          prev.map((c) => (c._id === data.conversationId ? { ...c, unreadCount: 0 } : c))
        );
      }
    };

    socket.on("chat:new_message_alert", handleNewMessageAlert);
    socket.on("messages:read", handleMessagesRead);

    return () => {
      socket.off("chat:new_message_alert", handleNewMessageAlert);
      socket.off("messages:read", handleMessagesRead);
    };
  }, [user, selectedConvId]);

  // Filter conversations by search and tab
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const partner = conv.participants?.find((p) => p._id !== user?.id);
      const partnerName = partner?.name || "User";
      const adTitle = conv.advertisement?.title || "";
      const matchesSearch =
        partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adTitle.toLowerCase().includes(searchQuery.toLowerCase());

      if (filterTab === "unread") {
        return matchesSearch && (conv.unreadCount || 0) > 0;
      }
      return matchesSearch;
    });
  }, [conversations, searchQuery, filterTab, user?.id]);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c._id === selectedConvId);
  }, [conversations, selectedConvId]);

  const handleSelectConversation = (conv: BackendConversation) => {
    setSelectedConvId(conv._id);
    setShowMobileChat(true);

    // Reset unread count locally
    setConversations((prev) =>
      prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleNewMessageSent = (convId: string, lastMsg: string) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c._id === convId);
      if (idx !== -1) {
        const updated = [...prev];
        const target = { ...updated[idx] };
        target.lastMessage = lastMsg;
        target.lastMessageAt = new Date().toISOString();
        target.lastMessageSender = user?.id;
        updated.splice(idx, 1);
        return [target, ...updated];
      }
      return prev;
    });
  };

  const formatWhatsAppTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Messages" }];

  return (
    <div className="space-y-4">
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Container - WhatsApp Web Shell */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* If user not logged in */}
        {!user ? (
          <div className="p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#0047BA]/10 text-[#0047BA] flex items-center justify-center mx-auto">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Sign in to view messages</h2>
            <p className="text-sm text-slate-500">
              Connect in real-time with verified buyers and sellers across Nepal to negotiate prices and inspect items safely.
            </p>
            <button
              onClick={openAuthModal}
              className="px-6 py-2.5 bg-[#0047BA] hover:bg-[#003893] text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
            >
              Sign In to DealDoko
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 h-[680px] max-h-[82vh]">
            {/* LEFT COLUMN: WhatsApp Web Conversation List */}
            <div
              className={`md:col-span-5 lg:col-span-4 border-r border-slate-200 flex flex-col bg-white h-full ${
                showMobileChat ? "hidden md:flex" : "flex"
              }`}
            >
              {/* WhatsApp Left Top Header */}
              <div className="bg-[#F0F2F5] px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-300 bg-white">
                    <Image
                      src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                      alt={user.name}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Chats</h2>
                    <span className="text-[11px] text-slate-500">
                      {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchConversations()}
                    disabled={isRefreshing}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-full transition-colors"
                    title="Refresh chats"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#00A884]" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Search Bar (WhatsApp Web style) */}
              <div className="p-2.5 bg-white border-b border-slate-100 shrink-0 space-y-2">
                <div className="relative flex items-center bg-[#F0F2F5] rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#00A884]/30 focus-within:bg-white transition-all">
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search or start new chat"
                    className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    onClick={() => setFilterTab("all")}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                      filterTab === "all"
                        ? "bg-[#E7FCE3] text-[#008069] font-bold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterTab("unread")}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1 ${
                      filterTab === "unread"
                        ? "bg-[#E7FCE3] text-[#008069] font-bold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>Unread</span>
                    {conversations.some((c) => (c.unreadCount || 0) > 0) && (
                      <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {isLoading ? (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-[#00A884] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500">Loading your conversations...</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">No chats found</p>
                    <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                      Find an ad you like on DealDoko and click &apos;Chat with Seller&apos; to start negotiating.
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1 text-xs text-[#0047BA] font-bold hover:underline pt-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Browse Classifieds</span>
                    </Link>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isSelected = selectedConvId === conv._id;
                    const partner = conv.participants?.find((p) => p._id !== user.id);
                    const partnerName = partner?.name || "Seller";
                    const partnerAvatar =
                      partner?.avatar ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";

                    const adImage =
                      typeof conv.advertisement?.images?.[0] === "string"
                        ? conv.advertisement.images[0]
                        : conv.advertisement?.images?.[0]?.url || "";

                    const isLastMsgMe = conv.lastMessageSender === user.id;
                    const unread = conv.unreadCount || 0;

                    return (
                      <div
                        key={conv._id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative ${
                          isSelected ? "bg-[#F0F2F5]" : "hover:bg-slate-50"
                        }`}
                      >
                        {/* Partner Avatar */}
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <Image
                            src={partnerAvatar}
                            alt={partnerName}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>

                        {/* Middle Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {partnerName}
                              </h4>
                              {partner?.isVerified && (
                                <BadgeCheck className="w-3.5 h-3.5 text-[#0047BA] shrink-0" />
                              )}
                            </div>
                            <span
                              className={`text-[10px] shrink-0 ${
                                unread > 0 ? "text-[#25D366] font-bold" : "text-slate-400"
                              }`}
                            >
                              {formatWhatsAppTime(conv.lastMessageAt || conv.updatedAt)}
                            </span>
                          </div>

                          {/* Product Chip */}
                          {conv.advertisement && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-semibold text-[#0047BA] bg-blue-50/80 px-1.5 py-0.5 rounded truncate max-w-[170px]">
                                🏷️ {conv.advertisement.title}
                              </span>
                              <span className="text-[10px] font-bold text-slate-700">
                                {formatPrice(conv.advertisement.price)}
                              </span>
                            </div>
                          )}

                          {/* Last message preview */}
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                              {isLastMsgMe && (
                                <CheckCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
                              )}
                              <span>{conv.lastMessage || "Click to open chat"}</span>
                            </p>

                            {/* WhatsApp Green Unread Badge */}
                            {unread > 0 && (
                              <span className="min-w-5 h-5 px-1.5 bg-[#25D366] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 ml-1 shadow-2xs">
                                {unread}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Product mini thumbnail on far right */}
                        {adImage && (
                          <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 ml-1">
                            <Image
                              src={adImage}
                              alt="Ad"
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Active WhatsApp Chat Window */}
            <div
              className={`md:col-span-7 lg:col-span-8 flex flex-col h-full bg-[#EFEAE2] ${
                !showMobileChat ? "hidden md:flex" : "flex"
              }`}
            >
              {activeConversation ? (
                <ChatWindow
                  conversationId={activeConversation._id}
                  initialConversation={activeConversation}
                  onBack={() => setShowMobileChat(false)}
                  onNewMessageSent={handleNewMessageSent}
                />
              ) : (
                /* Authentic WhatsApp Web Placeholder Screen */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F0F2F5] border-b-4 border-[#00A884]">
                  <div className="max-w-md space-y-4">
                    <div className="w-24 h-24 rounded-full bg-white shadow-xs flex items-center justify-center mx-auto border border-slate-200">
                      <MessageSquare className="w-12 h-12 text-[#00A884]" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">
                      DealDoko Web Messenger
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Send and receive real-time messages with verified sellers and buyers across Nepal. Negotiate prices, schedule product inspections, and chat safely.
                    </p>
                    <div className="pt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>End-to-end encrypted classified conversations</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500">
          <div className="w-6 h-6 border-2 border-[#00A884] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading DealDoko Chat...</span>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}