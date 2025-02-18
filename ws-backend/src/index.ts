import { WebSocketServer } from "ws";
import mongoose from "mongoose";
import { userModel } from "./db";

mongoose.connect("mongodb://localhost:27017/referral");


const wss = new WebSocketServer({ port: 8080 });
const userSockets = new Map(); // Store active WebSocket connections

wss.on("connection", (socket) => {
  socket.on("message", async (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === "join") {
      userSockets.set(data.userId, socket);
    }

    if (data.type === "transaction") {
      const user = await userModel.findOne({ email: data.email });
      if (userSockets.has(user._id.toString())) {
        userSockets.get(user._id.toString()).send(
          JSON.stringify({
            type: "updateEarnings",
            userId: user._id.toString(),
            newEarnings: user.earnings,
          })
        );
      }

      if (user?.referredBy) {
        const referrer = await userModel.findById(user.referredBy);
        if (referrer && userSockets.has(referrer._id.toString())) {
          userSockets.get(referrer._id.toString()).send(
            JSON.stringify({
              type: "updateEarnings",
              userId: referrer._id.toString(),
              newEarnings: referrer.earnings,
            })
          );
        }

        if (referrer?.referredBy) {
          const referrer2 = await userModel.findById(referrer.referredBy);
          if (referrer2 && userSockets.has(referrer2._id.toString())) {
            userSockets.get(referrer2._id.toString()).send(
              JSON.stringify({
                type: "updateEarnings",
                userId: referrer2._id.toString(),
                newEarnings: referrer2.earnings,
              })
            );
          }
        }
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
