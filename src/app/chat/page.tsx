"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MOCK_PRODUCTS } from "@/data/products";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { formatPrice } from "@/lib/utils";
import { MessageSquare, ArrowLeft, ShieldCheck } from "lucide-react";

export default function ChatPage() {
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Take top 4 products as sample active conversations
  const sampleConversations = MOCK_PRODUCTS.slice(0, 4);
  const activeProduct = sampleConversations[selectedProductIndex];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Messages" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Main Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#0047BA]/10 text-[#0047BA]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">Buyer &amp; Seller Messages</h1>
              <p className="text-xs text-slate-500">Live negotiation &amp; communication</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>End-to-end safe chat</span>
          </div>
        </div>

        {/* 2-Column Chat Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
          {/* Conversation List (Left) */}
          <div
            className={`md:col-span-4 border-r border-slate-200 divide-y divide-slate-100 overflow-y-auto ${
              showMobileChat ? "hidden md:block" : "block"
            }`}
          >
            <div className="p-3 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Recent Chats ({sampleConversations.length})
            </div>

            {sampleConversations.map((prod, idx) => {
              const isSelected = selectedProductIndex === idx;

              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    setSelectedProductIndex(idx);
                    setShowMobileChat(true);
                  }}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-slate-100/80" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <Image
                      src={prod.images[0] || ""}
                      alt={prod.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{prod.seller.name}</h4>
                      <span className="text-[10px] text-slate-400">10:14 AM</span>
                    </div>

                    <p className="text-xs font-medium text-slate-800 truncate mt-0.5">
                      {prod.title}
                    </p>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-[#0047BA]">
                        {formatPrice(prod.price)}
                      </span>
                      {idx === 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#FF6A00]" title="New message" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Chat Window (Right) */}
          <div
            className={`md:col-span-8 flex flex-col ${
              !showMobileChat ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Mobile Back Button */}
            <div className="md:hidden p-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
              <button
                onClick={() => setShowMobileChat(false)}
                className="flex items-center gap-1 text-xs font-bold text-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Conversations</span>
              </button>
            </div>

            {activeProduct ? (
              <ChatWindow product={activeProduct} />
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-sm">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
