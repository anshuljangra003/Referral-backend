"use client";

import axios from "axios";
import { useEffect, useState } from "react";

function Transaction({
  email,
  userId,
  earnings,
}: {
  email: string;
  userId: string;
  earnings: number;
}) {
  const [amount, setAmount] = useState(0);
  const [earning, setEarning] = useState(earnings);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "join", userId }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "updateEarnings" && data.userId === userId) {
        setEarning(data.newEarnings);
        alert("Earnings updated");
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [userId]);

  async function sendTransaction() {
    try {
      await axios.post("http://localhost:3001/transaction", {
        email,
        amount,
      });

      // Ensure WebSocket is open before sending transaction update
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "transaction",
            email,
            amount,
          })
        );
      }

      // Reset input and update UI immediately
      setAmount(0);
    } catch (error) {
      console.error("Transaction failed", error);
    }
  }

  return (
    <div>
      <h1>Earnings - {earning}</h1>
      <input
        type="number"
        placeholder="Enter Amount"
        value={amount}
        className="text-black border-b-2"
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-sm"
        onClick={sendTransaction}
      >
        Transaction
      </button>
    </div>
  );
}

export default Transaction;
