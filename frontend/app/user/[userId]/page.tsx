// import ReferralDetails from "@/components/ReferralDetails";
import Transaction from "@/components/Transaction";
import axios from "axios";

async function Page({ params }: { params: { userId: string } }) {
  try {
    const  userId  = (await params).userId;
    console.log("User ID:", userId);

    const { data } = await axios.get(`http://localhost:3001/user/${userId}`);
    const user = data.user;

   
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-200 to-gray-400">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg text-center">
         
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, <span className="text-indigo-600">{user.name}!</span> 🎉
          </h1>

     
          <p className="mt-4 text-lg text-gray-600"> 
            Your Referral Code:{" "}
            <span className="font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md">
              {user.referralCode}
            </span>
          </p>

         
          {user.referredBy && (
            <p className="mt-2 text-sm text-gray-500">
              (Referred by User ID:{" "}
              <span className="font-medium text-gray-700">{user.referredBy}</span>)

            </p>
          )}

         


          <div className="mt-6">
            <Transaction
              email={user.email}
              userId={user._id}
              earnings={user.earnings}
              referredlength={user.referrals.length}
            />
            {/* <ReferralDetails user={user}/> */}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-500">Error loading user data. Please try again.</p>
      </div>
    );
  }
}

export default Page;
