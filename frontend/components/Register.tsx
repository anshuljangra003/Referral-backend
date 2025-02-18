"use client"

import axios from "axios"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Register() {

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [referralCode, setReferralCode] = useState("")
    const router = useRouter()

    async function sendRequest() {
        console.log("first")
        // const flag=await axios.get("http://localhost:3001/user/user)
        const data = await axios.post("http://localhost:3001/register", {
            name,
            email,
            referralCode
        })

        console.log(data.data)
        if (data.status === 200) {
            router.push(`/user/${data.data.user._id}`)
        }
    }

    return (
        <div className=" flex justify-center items-center bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Register</h2>
                
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Referral Code(Optional)"
                        value={referralCode}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setReferralCode(e.target.value)}
                    />
                </div>

                <div className="flex justify-center">
                    <button
                        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                        onClick={sendRequest}
                    >
                        Register
                    </button>
                </div>
            </div>
        </div>
    )
}
