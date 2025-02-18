import mongoose, { Mongoose, Schema }  from "mongoose";
mongoose.connect("mongodb://localhost:27017/referral").then(()=>{
    console.log("working")
}).catch((err)=>{
    console.log(err)
});


const UserSchema = new Schema({
    name: String,
    email: String,
    referralCode: String,
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    earnings: Number
});


// @ts-ignore
export const userModel=new mongoose.model('User', UserSchema);
