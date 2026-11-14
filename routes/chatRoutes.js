import express from "express";
import {
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markConversationRead,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // All chat endpoints require JWT authentication

router.post("/conversations", getOrCreateConversation);
router.get("/conversations", getUserConversations);
router.get("/conversations/:id/messages", getConversationMessages);
router.post("/conversations/:id/messages", sendMessage);
router.put("/conversations/:id/read", markConversationRead);

export default router;
