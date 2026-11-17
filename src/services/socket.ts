import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SOCKET_URL } from "./api";

let socket: Socket | null = null;

export const initSocket = async (): Promise<Socket> => {
  if (socket?.connected) {
    return socket;
  }

  const token = await AsyncStorage.getItem("dealdheko_auth_token");

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: true,
    auth: {
      token,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("[DealDheko Socket] Connected with ID:", socket?.id);
  });

  socket.on("connect_error", (error) => {
    console.warn("[DealDheko Socket] Connection Error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("[DealDheko Socket] Disconnected:", reason);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
