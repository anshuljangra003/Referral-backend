import express from "express";

import { transactionModel, userModel } from "./db";

import { z } from "zod";

const userSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  referralCode: z.string().optional(),
});

const app = express();

app.use(express.json());

app.get("/users", async (req, res) => {
  const users = await userModel.find({});
  res.json({
    users,
  });
});

app.post("/register", async (req, res) => {
  const { name, email, referralCode } = req.body;

  let referredByUser = null;
  if (referralCode) {
    referredByUser = await userModel.findOne({ referralCode });
  }
  const { success } = userSchema.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: "Invalid INPUT TYPE",
    });
  }
  const user = await userModel.create({
    name,
    email,
    referralCode: Math.random().toString(36),
    referredBy: referredByUser ? referredByUser._id : null,
    earnings: 0,
  });

  if (referredByUser) {
     referredByUser.referrals.push(user._id);
    await referredByUser.save();
  }

  res.json({
    message: "user created successfully",
    user,
  });
});


app.post("/transaction", async (req, res) => {
  const { email, amount } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    res.status(404).json({
      message: "user not found",
    });
  }
  let totalSpent = 0;
  if (amount > 1000) {
    let UserreferredBy = user.referredBy;
    if (UserreferredBy) {
     UserreferredBy = await userModel.findOne(user.referredBy);
      UserreferredBy.earnings += amount * 0.05;
      totalSpent += amount * 0.05;
      // ws call
      notifyUser(UserreferredBy._id.toString(), UserreferredBy.earnings);
      await UserreferredBy.save();
    }
    if (UserreferredBy.referredBy) {
      const UserreferredBy2 = await userModel.findOne(
        UserreferredBy.referredBy
      );
      UserreferredBy2.earnings += amount * 0.01;
      totalSpent += amount * 0.01;
      notifyUser(UserreferredBy2._id.toString(), UserreferredBy2.earnings);

      await UserreferredBy2.save();
    }
  }

  user.earnings += amount - totalSpent;
  await transactionModel.create({
    user: user._id,
    amount,
    earningsDistributed: totalSpent > 0,
    date: new Date(),
  });
  await user.save();

  res.json({
    message: "transaction successful",
  });


});

app.get("/transactions", async (req, res)=>{
    const transactions=await transactionModel.find({});
    res.json({
        transactions
    })
} )

app.listen(3000);
