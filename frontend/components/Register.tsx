"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWebSocket } from "@/context/WebSocketProvider";

export default function Register() {
  const { sendMessage } = useWebSocket();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function sendRequest() {
    if (!name || !email) {
      setError("Name and Email are required.");
      return;
    }
    setError("");

    try {
      const { data } = await axios.post("http://localhost:3001/register", {
        name,
        email,
        referralCode,
      });

      if (data?.user?._id) {
        sendMessage({ type: "join", userId: data.user._id });

        if (data.user.referredBy) {
          const referrerData = await axios.get(
            `http://localhost:3001/user/${data.user.referredBy}`
          );
          sendMessage({
            type: "refer",
            email: referrerData.data.user.email,
          });
        }

        router.push(`/user/${data.user._id}`);
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800">Referral System</h1>
        <p className="text-gray-600 mt-1">Register now and start earning rewards!</p>
        {error && <p className="mt-3 text-red-500 text-sm font-semibold">{error}</p>}

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Referral Code (Optional)"
            value={referralCode}
            className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
            onChange={(e) => setReferralCode(e.target.value)}
          />
        </div>

        <button
          className="w-full mt-6 py-3 bg-indigo-600 text-white font-normal rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 active:scale-95"
          onClick={sendRequest}
        >
          Register Now
        </button>
      </div>
    </div>
  );
}
