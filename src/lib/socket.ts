import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage.getItem("dealdoko_token") || "";
    }

    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      withCredentials: true,
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      // connected successfully
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("Socket connection warning:", err.message);
    });
  }

  return socketInstance;
};

export const updateSocketAuth = (token: string) => {
  if (socketInstance) {
    socketInstance.auth = { token };
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
  }
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export default getSocket;
