import { WebSocket, WebSocketServer } from "ws";


const wss = new WebSocketServer({ port: 8080 });

interface UserConnection {
  userId: string;
  socket: WebSocket;
}

const allSockets: UserConnection[] = [];

wss.on("connection", (socket) => {
  console.log("✅ New WebSocket connection established");

  socket.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === "join") {
        
        allSockets.push({ userId: data.payload.userId, socket });
        console.log(`📌 User ${data.payload.userId} joined WebSocket`);
      }
    } catch (error) {
      console.error("❌ Error processing message:", error);
    }
  });

  socket.on("close", () => {
    // Remove disconnected users
    for (let i = allSockets.length - 1; i >= 0; i--) {
      if (allSockets[i].socket === socket) {
        console.log(`⚠️ User ${allSockets[i].userId} disconnected`);
        allSockets.splice(i, 1);
      }
    }
  });
});

/**
 * Notify a user in real-time when their referrals (Level 1 or 2) earn money.
 * @param userId - The ID of the parent user to notify.
 * @param earnings - The updated earnings amount.
 */
export const notifyUser = (userId: string, earnings: number) => {
  const userSockets = allSockets.filter((u) => u.userId === userId);
  userSockets.forEach((user) => {
    if (user.socket.readyState === WebSocket.OPEN) {
      user.socket.send(JSON.stringify({ type: "earningsUpdate", earnings }));
      console.log(`📩 Earnings update sent to ${userId}: ₹${earnings}`);
    }
  });
};
