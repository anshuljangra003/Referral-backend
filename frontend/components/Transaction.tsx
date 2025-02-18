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
    try {
        socket.onopen = () => {
            console.log("Connected to WebSocket");
            socket.send(JSON.stringify({ type: "join", userId }));
          };
      
          socket.onmessage = (event) => {
            console.log("Received WebSocket Message:", event.data);
            const data = JSON.parse(event.data);
            if (data.type === "updateEarnings" && data.userId === userId) {
              alert("Earnings updated");
              setEarning(data.newEarnings);
            }
          };
          setWs(socket);

      
    } catch (error) {
        console.log(error)
        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
          };
    }
   
  

   
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

      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log("Sending WebSocket message for transaction");
        ws.send(
          JSON.stringify({
            type: "transaction",
            email,
            amount,
          })
        );
      }

      setAmount(0);
    } catch (error) {
      console.error("Transaction failed", error);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Earnings: <span className="text-blue-600">₹{earning}</span>
      </h1>

      <div className="flex flex-col space-y-4">
        <input
          type="number"
          placeholder="Enter Amount"
          value={amount}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <button
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          onClick={sendTransaction}
        >
          Make Transaction
        </button>
      </div>
    </div>
  );
}

export default Transaction;