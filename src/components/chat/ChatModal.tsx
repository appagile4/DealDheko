"use client";

import React from "react";
import { Modal } from "@/components/common/Modal";
import { ChatWindow } from "./ChatWindow";
import { useMarketplace } from "@/context/MarketplaceContext";

export function ChatModal() {
  const { isChatModalOpen, closeChat, activeChatProduct } = useMarketplace();

  if (!activeChatProduct) return null;

  return (
    <Modal
      isOpen={isChatModalOpen}
      onClose={closeChat}
      title={`Chat with ${activeChatProduct.seller.name}`}
      maxWidth="lg"
    >
      <ChatWindow product={activeChatProduct} onClose={closeChat} />
    </Modal>
  );
}
