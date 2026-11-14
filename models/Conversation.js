import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    advertisement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advertisement",
      required: true,
      index: true,
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
