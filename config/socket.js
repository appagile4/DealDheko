import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
      ],
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        // Allow anonymous connection with limited access, or reject
        return next();
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "dealdoko_classifieds_nepal_jwt_secret_token_2026_key"
      );

      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.userName = user.name;
      }
      next();
    } catch (err) {
      // Continue without authenticated user context
      next();
    }
  });

  io.on("connection", (socket) => {
    // If authenticated, join user's private notification and direct message room
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);

      if (socket.userRole === "superadmin") {
        socket.join("superadmin_room");
      }
    }

    // Join a specific advertisement conversation room
    socket.on("chat:join", async ({ conversationId }) => {
      if (!conversationId) return;

      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Verify participant authorization
        if (socket.userId) {
          const isParticipant = conversation.participants.some(
            (p) => p.toString() === socket.userId
          );
          if (!isParticipant && socket.userRole !== "superadmin") {
            return socket.emit("chat:error", { message: "Unauthorized to join this conversation." });
          }
        }

        socket.join(`conversation_${conversationId}`);
        socket.emit("chat:joined", { conversationId });
      } catch (err) {
        socket.emit("chat:error", { message: "Failed to join chat room." });
      }
    });

    // Leave a conversation room
    socket.on("chat:leave", ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conversation_${conversationId}`);
      }
    });

    // Send a real-time message
    socket.on("message:send", async (data) => {
      try {
        const { conversationId, text, messageType = "text", attachments = [] } = data;

        if (!conversationId || !text || !text.trim()) {
          return socket.emit("chat:error", { message: "Message cannot be empty." });
        }

        if (!socket.userId) {
          return socket.emit("chat:error", { message: "Authentication required to send messages." });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return socket.emit("chat:error", { message: "Conversation not found." });
        }

        // Determine recipient
        const receiverId = conversation.participants.find(
          (p) => p.toString() !== socket.userId
        );

        if (!receiverId) {
          return socket.emit("chat:error", { message: "Recipient not found." });
        }

        // 1. Create message in MongoDB
        const newMessage = await Message.create({
          conversation: conversation._id,
          sender: socket.userId,
          receiver: receiverId,
          message: text.trim(),
          messageType,
          attachments,
        });

        // 2. Update conversation last message timestamp
        conversation.lastMessage = text.trim();
        conversation.lastMessageSender = socket.userId;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const populatedMessage = await Message.findById(newMessage._id).populate(
          "sender",
          "name avatar"
        );

        // 3. Broadcast to all users in the conversation room
        io.to(`conversation_${conversationId}`).emit("message:new", populatedMessage);

        // 4. Send direct real-time alert to recipient
        io.to(`user_${receiverId}`).emit("chat:new_message_alert", {
          conversationId,
          message: populatedMessage,
          senderName: socket.userName,
        });
      } catch (err) {
        console.error("Socket Message Error:", err);
        socket.emit("chat:error", { message: "Failed to deliver message." });
      }
    });

    // Typing Indicators
    socket.on("typing:start", ({ conversationId }) => {
      if (conversationId) {
        socket.to(`conversation_${conversationId}`).emit("typing:update", {
          conversationId,
          isTyping: true,
          userId: socket.userId,
          userName: socket.userName,
        });
      }
    });

    socket.on("typing:stop", ({ conversationId }) => {
      if (conversationId) {
        socket.to(`conversation_${conversationId}`).emit("typing:update", {
          conversationId,
          isTyping: false,
          userId: socket.userId,
        });
      }
    });

    socket.on("disconnect", () => {
      // Automatic cleanup handled by socket.io
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};
