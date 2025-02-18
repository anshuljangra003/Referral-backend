"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyUser = void 0;
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const allSockets = [];
wss.on("connection", (socket) => {
    console.log("✅ New WebSocket connection established");
    socket.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = JSON.parse(message.toString());
            if (data.type === "join") {
                // Store user connection for real-time updates
                allSockets.push({ userId: data.payload.userId, socket });
                console.log(`📌 User ${data.payload.userId} joined WebSocket`);
            }
        }
        catch (error) {
            console.error("❌ Error processing message:", error);
        }
    }));
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
const notifyUser = (userId, earnings) => {
    const userSockets = allSockets.filter((u) => u.userId === userId);
    userSockets.forEach((user) => {
        if (user.socket.readyState === ws_1.WebSocket.OPEN) {
            user.socket.send(JSON.stringify({ type: "earningsUpdate", earnings }));
            console.log(`📩 Earnings update sent to ${userId}: ₹${earnings}`);
        }
    });
};
exports.notifyUser = notifyUser;
