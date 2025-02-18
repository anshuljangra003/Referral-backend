
import Register from "@/components/Register";


export default function Home() {


  return (
    <div className="flex  justify-center p-5 h-screen">
      <div className="flex flex-col">
      <h1 className="font-light text-2xl items-center">Referral System</h1>
      <Register/>

      </div>
    </div>
  );
}