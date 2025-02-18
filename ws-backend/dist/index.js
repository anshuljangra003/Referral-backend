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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("./db");
mongoose_1.default.connect("mongodb://localhost:27017/referral");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const userSockets = new Map(); // Store active WebSocket connections
wss.on("connection", (socket) => {
    socket.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
        const data = JSON.parse(message.toString());
        if (data.type === "join") {
            userSockets.set(data.userId, socket);
        }
        if (data.type === "transaction") {
            const user = yield db_1.userModel.findOne({ email: data.email });
            if (user === null || user === void 0 ? void 0 : user.referredBy) {
                const referrer = yield db_1.userModel.findById(user.referredBy);
                if (referrer && userSockets.has(referrer._id.toString())) {
                    userSockets.get(referrer._id.toString()).send(JSON.stringify({
                        type: "updateEarnings",
                        userId: referrer._id.toString(),
                        newEarnings: referrer.earnings,
                    }));
                }
                if (referrer === null || referrer === void 0 ? void 0 : referrer.referredBy) {
                    const referrer2 = yield db_1.userModel.findById(referrer.referredBy);
                    if (referrer2 && userSockets.has(referrer2._id.toString())) {
                        userSockets.get(referrer2._id.toString()).send(JSON.stringify({
                            type: "updateEarnings",
                            userId: referrer2._id.toString(),
                            newEarnings: referrer2.earnings,
                        }));
                    }
                }
            }
        }
    }));
    socket.on("close", () => {
        for (let [key, value] of userSockets.entries()) {
            if (value === socket) {
                userSockets.delete(key);
            }
        }
    });
});
