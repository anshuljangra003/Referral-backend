import { WebSocketServer } from "ws";
import mongoose from "mongoose";
import { userModel } from "./db";

mongoose.connect("mongodb://localhost:27017/referral");

const wss = new WebSocketServer({ port: 8080 });
const userSockets = new Map();

wss.on("connection", (socket) => {
  socket.on("message", async (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === "join") {
      userSockets.set(data.userId, socket);
    }

    if (data.type === "transaction") {
      const user = await userModel.findOne({ email: data.email });
      if (user && userSockets.has(user._id.toString())) {
        userSockets.get(user._id.toString()).send(
          JSON.stringify({
            type: "earningsUpdate",
            userId: user._id.toString(),
            amount: user.earnings,
          })
        );
      }
      if (user?.referredBy) {
        const referrer = await userModel.findById(user.referredBy);
        if (referrer && userSockets.has(referrer._id.toString())) {
          userSockets.get(referrer._id.toString()).send(
            JSON.stringify({
              type: "earningsUpdate",
              userId: referrer._id.toString(),
              amount: referrer.earnings,
            })
          );
        }
      }
    }

    if (data.type === "refer") {
      const user = await userModel.findOne({ email: data.email });
      if (user && userSockets.has(user._id.toString())) {
        userSockets.get(user._id.toString()).send(
          JSON.stringify({
            type: "referralUpdate",
            userId: user._id.toString(),
            count: user.referrals.length,
          })
        );
      }
    }
  });

  socket.on("close", () => {
    for (let [key, value] of userSockets.entries()) {
      if (value === socket) {
        userSockets.delete(key);
      }
    }
  });
});
