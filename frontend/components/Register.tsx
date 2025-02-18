"use client"

import axios from "axios"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Register() {

        const [name, setName] = useState("")
        const [email, setEmail] = useState("")
        const[referralCode, setReferralCode] = useState("")
        const router=useRouter();

        async function sendRequest(){   
            console.log("first")
            // const flag=await axios.get("http://localhost:3001/user/user)
            const data=await axios.post("http://localhost:3001/register",{
                name,
                email,
                referralCode
            })

            console.log(data.data);
            if(data.status===200){
                router.push(`/user/${data.data.user._id}`)
            }

        }   

        return (
            <div>
                <input type="text" placeholder="Name" value={name} className="border-2 text-black border-gray-300 p-2 m-2" onChange={(e)=>{
                    setName(e.target.value)
                }}/>
                <input type="text" placeholder="Email" value={email} className="border-2 text-black border-gray-300 p-2 m-2" onChange={(e)=>{
                    setEmail(e.target.value)
                }} />
                <input type="text" value={referralCode} placeholder="Referral Code" className="border-2 text-black border-gray-300 p-2 m-2" onChange={(e)=>{
                    setReferralCode(e.target.value)
                }}/>
                <button className="bg-blue-500 text-white p-2 m-2" onClick={sendRequest}>Register</button>
            </div>
        )

}