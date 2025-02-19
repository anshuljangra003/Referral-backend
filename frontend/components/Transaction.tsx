"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useWebSocket } from "@/context/WebSocketProvider";

export default function Transaction({
  email,
  userId,
  earnings,
  referredlength,
}: {
  email: string;
  userId: string;
  earnings: number;
  referredlength: number;
}) {
  const { sendMessage, ws, message } = useWebSocket();
  const [amount, setAmount] = useState(0);
  const [earning, setEarning] = useState(earnings);
  const [referred, setReferred] = useState(referredlength);

  useEffect(() => {
    if (ws) {
      sendMessage({ type: "join", userId });

      return () => {
        sendMessage({ type: "leave", userId });
      };
    }
  }, [ws, userId]);

  useEffect(() => {
    if (!message) return;

    if (message.type === "referralUpdate" && message.userId === userId) {
      setReferred(message.count);
    }

    if (message.type === "earningsUpdate" && message.userId === userId) {
      setEarning(message.amount);
    }
  }, [message, userId]);

  async function sendTransaction() {
    try {
      await axios.post("http://localhost:3001/transaction", { email, amount });
      sendMessage({ type: "transaction", email, amount });
      setAmount(0);
    } catch {}
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <p className="mt-4 text-lg text-gray-800">
        Referred users: <span className="font-bold text-green-600">{referred}</span>
      </p>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Earnings: <span className="text-blue-600">₹{earning}</span>
      </h1>
      <div className="flex flex-col space-y-4">
        <input
          type="number"
          placeholder="Enter Amount"
          value={amount}
          className="w-full px-4 py-2 border text-black border-gray-300 rounded-md"
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md" onClick={sendTransaction}>
          Make Transaction
        </button>
      </div>
    </div>
  );
}
