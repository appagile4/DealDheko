import React from "react";
import { ChatMessage } from "@/types/chat";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isMe = message.isMe;

  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}>
      <div
        className={`max-w-[75%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMe
            ? "bg-[#0047BA] text-white rounded-br-xs"
            : "bg-slate-100 text-slate-900 rounded-bl-xs border border-slate-200"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
      <span className="text-[10px] text-slate-400 px-1">
        {message.timestamp}
      </span>
    </div>
  );
}
