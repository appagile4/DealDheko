import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

let io = null;
const activeUsers = new Map(); // userId -> Set of socketIds

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://192.168.1.12:3000",
      ],
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  // Helper to authenticate a user token
  const authenticateToken = async (token) => {
    if (!token) return null;
    try {
      const cleanToken = token.replace("Bearer ", "").trim();
      const decoded = jwt.verify(
        cleanToken,
        process.env.JWT_SECRET || "dealdoko_classifieds_nepal_jwt_secret_token_2026_key"
      );
      const user = await User.findById(decoded.id).select("-password");
      return user;
    } catch {
      return null;
    }
  };

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization ||
        socket.handshake.query?.token;

      if (!token) {
        return next();
      }

      const user = await authenticateToken(token);
      if (user) {
        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.userName = user.name;
      }
      next();
    } catch {
      next();
    }
  });

  io.on("connection", (socket) => {
    // If authenticated during handshake, register presence
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
      if (socket.userRole === "superadmin") {
        socket.join("superadmin_room");
      }
      if (!activeUsers.has(socket.userId)) {
        activeUsers.set(socket.userId, new Set());
      }
      activeUsers.get(socket.userId).add(socket.id);

      io.emit("user:online_status", {
        userId: socket.userId,
        isOnline: true,
      });
    }

    // Allow explicit runtime authentication from client (e.g. after login)
    socket.on("authenticate", async ({ token }) => {
      if (!token) return;
      const user = await authenticateToken(token);
      if (user) {
        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.userName = user.name;
        socket.join(`user_${socket.userId}`);

        if (socket.userRole === "superadmin") {
          socket.join("superadmin_room");
        }

        if (!activeUsers.has(socket.userId)) {
          activeUsers.set(socket.userId, new Set());
        }
        activeUsers.get(socket.userId).add(socket.id);

        socket.emit("authenticated", {
          userId: socket.userId,
          userName: socket.userName,
          userRole: socket.userRole,
        });

        io.emit("user:online_status", {
          userId: socket.userId,
          isOnline: true,
        });
      } else {
        socket.emit("auth:error", { message: "Invalid authentication token." });
      }
    });

    // Check user online status
    socket.on("user:check_online", ({ userId }, callback) => {
      const isOnline = activeUsers.has(userId) && activeUsers.get(userId).size > 0;
      if (typeof callback === "function") {
        callback({ userId, isOnline });
      } else {
        socket.emit("user:status_response", { userId, isOnline });
      }
    });

    // Join a specific advertisement conversation room
    socket.on("chat:join", async ({ conversationId, token }) => {
      if (!conversationId) return;

      try {
        if (!socket.userId && token) {
          const user = await authenticateToken(token);
          if (user) {
            socket.userId = user._id.toString();
            socket.userName = user.name;
            socket.userRole = user.role;
            socket.join(`user_${socket.userId}`);
          }
        }

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
      } catch {
        socket.emit("chat:error", { message: "Failed to join chat room." });
      }
    });

    // Leave a conversation room
    socket.on("chat:leave", ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conversation_${conversationId}`);
      }
    });

    // Mark messages as read in conversation
    socket.on("chat:read", async ({ conversationId, token }) => {
      if (!conversationId) return;
      if (!socket.userId && token) {
        const user = await authenticateToken(token);
        if (user) socket.userId = user._id.toString();
      }

      if (!socket.userId) return;

      try {
        await Message.updateMany(
          {
            conversation: conversationId,
            receiver: socket.userId,
            isRead: false,
          },
          {
            $set: { isRead: true, readAt: new Date() },
          }
        );

        io.to(`conversation_${conversationId}`).emit("messages:read", {
          conversationId,
          readerId: socket.userId,
          readAt: new Date(),
        });
      } catch (err) {
        console.error("chat:read error:", err);
      }
    });

    // Send a real-time message
    socket.on("message:send", async (data) => {
      try {
        const {
          conversationId,
          text,
          message: rawMessage,
          messageType = "text",
          attachments = [],
          token,
        } = data;

        const content = (text || rawMessage || "").trim();

        if (!conversationId || !content) {
          return socket.emit("chat:error", { message: "Message cannot be empty." });
        }

        // Late token authentication fallback
        if (!socket.userId && token) {
          const user = await authenticateToken(token);
          if (user) {
            socket.userId = user._id.toString();
            socket.userName = user.name;
            socket.userRole = user.role;
            socket.join(`user_${socket.userId}`);
          }
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
          message: content,
          messageType,
          attachments,
        });

        // 2. Update conversation last message timestamp & sender
        conversation.lastMessage = content;
        conversation.lastMessageSender = socket.userId;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const populatedMessage = await Message.findById(newMessage._id).populate(
          "sender",
          "name avatar"
        );

        const normalizedPayload = {
          _id: populatedMessage._id,
          id: populatedMessage._id.toString(),
          conversation: conversation._id,
          sender: populatedMessage.sender,
          receiver: receiverId,
          message: populatedMessage.message,
          text: populatedMessage.message,
          messageType: populatedMessage.messageType,
          attachments: populatedMessage.attachments,
          isRead: populatedMessage.isRead,
          createdAt: populatedMessage.createdAt,
          updatedAt: populatedMessage.updatedAt,
        };

        // 3. Broadcast to all users in the conversation room
        io.to(`conversation_${conversationId}`).emit("message:new", normalizedPayload);

        // 4. Send direct real-time alert to recipient
        io.to(`user_${receiverId}`).emit("chat:new_message_alert", {
          conversationId,
          message: normalizedPayload,
          senderName: socket.userName || populatedMessage.sender?.name,
        });
      } catch (err) {
        console.error("Socket Message Error:", err);
        socket.emit("chat:error", { message: "Failed to deliver message." });
      }
    });

    // Typing Indicators
    socket.on("typing:start", ({ conversationId }) => {
      if (conversationId && socket.userId) {
        socket.to(`conversation_${conversationId}`).emit("typing:update", {
          conversationId,
          isTyping: true,
          userId: socket.userId,
          userName: socket.userName,
        });
      }
    });

    socket.on("typing:stop", ({ conversationId }) => {
      if (conversationId && socket.userId) {
        socket.to(`conversation_${conversationId}`).emit("typing:update", {
          conversationId,
          isTyping: false,
          userId: socket.userId,
        });
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId && activeUsers.has(socket.userId)) {
        const userSockets = activeUsers.get(socket.userId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          activeUsers.delete(socket.userId);
          io.emit("user:online_status", {
            userId: socket.userId,
            isOnline: false,
          });
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};
