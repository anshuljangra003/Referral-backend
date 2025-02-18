import Transaction from "@/components/Transaction";
import axios from "axios";


async function page({params}:{params:{userId:string}}) {

    const param=(await params).userId;
    console.log(param)

    const res=await axios.get("http://localhost:3001/user/"+param);
   
    



  return (
    <div>
        <h1>
        Welcome {res.data.user.name}
        </h1>
       
        <Transaction  email={res.data.user.email} userId={res.data.user._id} earnings={res.data.user.earnings}/>
    </div>
  )
}

export default page