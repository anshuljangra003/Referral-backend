"use client";

import { createContext, useContext, useEffect, useState } from "react";

type WebSocketMessage = 
  | { type: "referralUpdate"; userId: string; count: number }
  | { type: "earningsUpdate"; userId: string; amount: number }
  | { type: "transaction"; email: string; amount: number }
  | { type: "join"; userId: string }
  | { type: "leave"; userId: string };

type WebSocketContextType = {
  ws: WebSocket | null;
  sendMessage: (message: object) => void;
  message: WebSocketMessage | null;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    let socket: WebSocket;
    let retryTimeout: NodeJS.Timeout;

    const connect = () => {
      socket = new WebSocket("ws://localhost:8080");

      socket.onopen = () => {
        setWs(socket);
      };

      socket.onmessage = (event) => {
        try {
          const parsedMessage = JSON.parse(event.data);
          setMessage(parsedMessage);
        } catch {}
      };

      socket.onclose = () => {
        setWs(null);
        retryTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = () => {};
    };

    connect();

    return () => {
      socket?.close();
      clearTimeout(retryTimeout);
    };
  }, []);

  const sendMessage = (message: object) => {
    if (ws && ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider value={{ ws, sendMessage, message }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
