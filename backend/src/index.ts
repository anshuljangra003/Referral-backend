import express from "express";
import { transactionModel, userModel } from "./db";
import cors from "cors";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  referralCode: z.string().optional(),
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/users", async (req, res) => {
  try {
    const users = await userModel.find({});
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.get("/user/:userId", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);
    if (!user) {
     res.status(404).json({ message: "User not found" });
        return
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, referralCode } = req.body;

    if (!userSchema.safeParse(req.body).success) {
      res.status(400).json({ message: "Invalid input type" });
        return
    }

    let user = await userModel.findOne({ email });
    if (user) {
      res.json({ message: "User already exists", user });
        return
    }

    let referredByUser = referralCode
      ? await userModel.findOne({ referralCode })
      : null;

     user = await userModel.create({
      name,
      email,
      referralCode: Math.random().toString(36).substring(2),
      referredBy: referredByUser ? referredByUser._id : null,
      earnings: 0,
    });

    if (referredByUser) {
      referredByUser.referrals.push(user._id);
      await referredByUser.save();
    }

    res.json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.post("/transaction", async (req, res) => {
  try {
    const { email, amount } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
     res.status(404).json({ message: "User not found" });
    return;
    }

    let totalSpent = 0;

    if (amount > 1000) {
      let UserreferredBy = user.referredBy
        ? await userModel.findById(user.referredBy)
        : null;

      if (UserreferredBy) {
        UserreferredBy.earnings += amount * 0.05;
        totalSpent += amount * 0.05;
        await UserreferredBy.save();
      }

      if (UserreferredBy?.referredBy) {
        const UserreferredBy2 = await userModel.findById(
          UserreferredBy.referredBy
        );
        if (UserreferredBy2) {
          UserreferredBy2.earnings += amount * 0.01;
          totalSpent += amount * 0.01;
          await UserreferredBy2.save();
        }
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

    res.json({ message: "Transaction successful", user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.delete("/user/:userId", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return
    }

    await userModel.findByIdAndDelete(req.params.userId);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.get("/transactions", async (req, res) => {
  try {
    const transactions = await transactionModel.find({});
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
