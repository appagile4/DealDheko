import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Advertisement from "../models/Advertisement.js";
import { getIO } from "../config/socket.js";

/**
 * @desc    Get or create conversation between buyer, seller, and advertisement
 * @route   POST /api/chat/conversations
 * @access  Private
 */
export const getOrCreateConversation = async (req, res) => {
  try {
    const { advertisementId, sellerId } = req.body;

    if (!advertisementId) {
      return res.status(400).json({
        success: false,
        message: "Advertisement ID is required to initiate a conversation.",
      });
    }

    const ad = await Advertisement.findById(advertisementId);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found.",
      });
    }

    const actualSellerId = sellerId || ad.seller;

    // Seller cannot chat with themselves
    if (req.user._id.toString() === actualSellerId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot start a conversation on your own advertisement.",
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      advertisement: advertisementId,
      participants: { $all: [req.user._id, actualSellerId] },
    })
      .populate("participants", "name avatar isVerified city phone")
      .populate("advertisement", "title slug price images location status seller");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, actualSellerId],
        advertisement: advertisementId,
        lastMessage: "Conversation started",
        lastMessageSender: req.user._id,
        lastMessageAt: new Date(),
      });

      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "name avatar isVerified city phone")
        .populate("advertisement", "title slug price images location status seller");
    }

    // Fetch message history for this conversation
    const rawMessages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar");

    const messages = rawMessages.map((m) => ({
      _id: m._id,
      id: m._id.toString(),
      conversation: m.conversation,
      sender: m.sender,
      receiver: m.receiver,
      message: m.message,
      text: m.message,
      messageType: m.messageType,
      attachments: m.attachments,
      isRead: m.isRead,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    res.status(200).json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    console.error("Get/Create Conversation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate conversation.",
    });
  }
};

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/chat/conversations
 * @access  Private
 */
export const getUserConversations = async (req, res) => {
  try {
    const rawConversations = await Conversation.find({
      participants: req.user._id,
    })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "name avatar isVerified city phone")
      .populate("advertisement", "title slug price images location status seller")
      .lean();

    // Attach unread message counts for current user
    const conversations = await Promise.all(
      rawConversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          receiver: req.user._id,
          isRead: false,
        });
        return {
          ...conv,
          unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations.",
    });
  }
};

/**
 * @desc    Get message history for a conversation
 * @route   GET /api/chat/conversations/:id/messages
 * @access  Private
 */
export const getConversationMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access messages in this conversation.",
      });
    }

    // Mark unread messages sent to me as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        receiver: req.user._id,
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );

    // Notify partner via socket
    try {
      const io = getIO();
      if (io) {
        io.to(`conversation_${req.params.id}`).emit("messages:read", {
          conversationId: req.params.id,
          readerId: req.user._id.toString(),
          readAt: new Date(),
        });
      }
    } catch {}

    const rawMessages = await Message.find({ conversation: req.params.id })
      .sort({ createdAt: 1 })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar");

    const messages = rawMessages.map((m) => ({
      _id: m._id,
      id: m._id.toString(),
      conversation: m.conversation,
      sender: m.sender,
      receiver: m.receiver,
      message: m.message,
      text: m.message,
      messageType: m.messageType,
      attachments: m.attachments,
      isRead: m.isRead,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load messages.",
    });
  }
};

/**
 * @desc    Send message (REST API fallback)
 * @route   POST /api/chat/conversations/:id/messages
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { text, message: rawMessage, messageType = "text", attachments = [] } = req.body;
    const content = (text || rawMessage || "").trim();

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Message text cannot be empty.",
      });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const receiverId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: receiverId,
      message: content,
      messageType,
      attachments,
    });

    conversation.lastMessage = content;
    conversation.lastMessageSender = req.user._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await Message.findById(message._id).populate(
      "sender",
      "name avatar"
    );

    const normalized = {
      _id: populated._id,
      id: populated._id.toString(),
      conversation: conversation._id,
      sender: populated.sender,
      receiver: receiverId,
      message: populated.message,
      text: populated.message,
      messageType: populated.messageType,
      attachments: populated.attachments,
      isRead: populated.isRead,
      createdAt: populated.createdAt,
      updatedAt: populated.updatedAt,
    };

    // Emit Socket event if io available
    try {
      const io = getIO();
      if (io) {
        io.to(`conversation_${conversation._id}`).emit("message:new", normalized);
        io.to(`user_${receiverId}`).emit("chat:new_message_alert", {
          conversationId: conversation._id,
          message: normalized,
          senderName: req.user.name,
        });
      }
    } catch {
      // socket non-fatal
    }

    res.status(201).json({
      success: true,
      message: normalized,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send message.",
    });
  }
};

/**
 * @desc    Mark conversation messages as read
 * @route   PUT /api/chat/conversations/:id/read
 * @access  Private
 */
export const markConversationRead = async (req, res) => {
  try {
    await Message.updateMany(
      {
        conversation: req.params.id,
        receiver: req.user._id,
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );

    try {
      const io = getIO();
      if (io) {
        io.to(`conversation_${req.params.id}`).emit("messages:read", {
          conversationId: req.params.id,
          readerId: req.user._id.toString(),
          readAt: new Date(),
        });
      }
    } catch {}

    res.status(200).json({
      success: true,
      message: "Messages marked as read.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read.",
    });
  }
};
