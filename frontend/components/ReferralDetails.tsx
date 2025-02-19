"use client";
import React from 'react'
interface User{
    userId:string,
    name:string,
    email:string,
    referredBy:string,
    referralCode:string,
    referrals:string[],
    earnings:number
}
function ReferralDetails({user}:{user:User}) {

  return (
    <div>
        <button>
            Referral Details-
        </button>
    </div>
  )
}

export default ReferralDetails