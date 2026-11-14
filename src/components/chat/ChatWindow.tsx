"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { ChatMessage } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { formatPrice } from "@/lib/utils";
import { Send, Sparkles, ShieldAlert } from "lucide-react";

interface ChatWindowProps {
  product: Product;
  onClose?: () => void;
}

export function ChatWindow({ product }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      senderId: product.seller.id,
      senderName: product.seller.name,
      text: `Hello! Thanks for your interest in "${product.title}". It is available and in great condition. Feel free to ask any questions.`,
      timestamp: "10:14 AM",
      isMe: false,
    },
  ]);
  const [inputText, setInputText] = useState("");

  const QUICK_REPLIES = [
    "Is this still available?",
    "What is your final price?",
    "Can I inspect it today?",
    "Do you have the bill & warranty?",
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: "me",
      senderName: "Me",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText("");

    // Simulate realistic seller response after 1.2 seconds
    setTimeout(() => {
      const sellerReplies = [
        "Yes, it is available! Where are you located?",
        `I can offer a small discount if you can pick it up today from ${product.location.area || product.location.city}.`,
        "Sure, you are welcome to come and check it before deciding.",
        "Yes, original bill and accessories are intact as listed in the ad description.",
      ];
      const randomReply = sellerReplies[Math.floor(Math.random() * sellerReplies.length)];

      const sellerMsg: ChatMessage = {
        id: `m-reply-${Date.now()}`,
        senderId: product.seller.id,
        senderName: product.seller.name,
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: false,
      };

      setMessages((prev) => [...prev, sellerMsg]);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[520px] bg-white rounded-2xl overflow-hidden border border-slate-200">
      {/* Product Summary Mini Header */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 truncate">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
            <Image
              src={product.images[0] || ""}
              alt={product.title}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-slate-900 truncate">{product.title}</h4>
            <p className="text-xs font-extrabold text-[#0047BA]">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 block">Seller</span>
          <span className="text-xs font-bold text-slate-800">{product.seller.name}</span>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-amber-50 px-3 py-1.5 border-b border-amber-100 flex items-center gap-1.5 text-[11px] text-amber-800">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600" />
        <span>Never send advance payments or share OTPs before inspecting the item.</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Quick Reply Chips */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
        {QUICK_REPLIES.map((reply, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(reply)}
            className="text-xs whitespace-nowrap bg-white border border-slate-200 hover:border-[#FF6A00] hover:text-[#FF6A00] text-slate-700 px-2.5 py-1 rounded-full transition-colors shrink-0"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#0047BA] focus:ring-1 focus:ring-[#0047BA] transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-[#0047BA] text-white hover:bg-[#003894] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
