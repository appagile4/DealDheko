import React from "react";
import { ChatMessage } from "@/types/chat";
import { Check, CheckCheck } from "lucide-react";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isMe = message.isMe;

  return (
    <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"} my-1 px-2`}>
      <div
        className={`relative max-w-[85%] sm:max-w-[72%] md:max-w-[65%] px-3 pt-2 pb-1.5 rounded-2xl shadow-[0_1px_0.5px_rgba(11,20,26,0.12)] ${
          isMe
            ? "bg-[#D9FDD3] text-[#111B21] rounded-tr-xs"
            : "bg-white text-[#111B21] rounded-tl-xs border border-slate-100/80"
        }`}
      >
        {/* Message Content */}
        <p className="text-[13.5px] sm:text-[14px] leading-relaxed whitespace-pre-wrap select-text pr-12 pb-1">
          {message.text}
        </p>

        {/* Timestamp and Delivery / Read Status (WhatsApp Style) */}
        <div className="absolute right-2.5 bottom-1 flex items-center gap-1 select-none pointer-events-none">
          <span className="text-[10px] text-[#667781] font-normal leading-none">
            {message.timestamp}
          </span>
          {isMe && (
            <span className="inline-flex items-center" title={message.isRead ? "Read" : "Delivered"}>
              {message.isRead ? (
                <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB] stroke-[2.5]" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5 text-[#8696A0] stroke-[2.5]" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
