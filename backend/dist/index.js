"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
const userSchema = zod_1.z.object({
    name: zod_1.z.string().nonempty(),
    email: zod_1.z.string().email(),
    referralCode: zod_1.z.string().optional(),
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield db_1.userModel.find({});
        res.json({ users });
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
}));
app.get("/user/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db_1.userModel.findById(req.params.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
}));
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, referralCode } = req.body;
        if (!userSchema.safeParse(req.body).success) {
            res.status(400).json({ message: "Invalid input type" });
            return;
        }
        let user = yield db_1.userModel.findOne({ email });
        if (user) {
            res.json({ message: "User already exists", user });
            return;
        }
        let referredByUser = referralCode
            ? yield db_1.userModel.findOne({ referralCode })
            : null;
        user = yield db_1.userModel.create({
            name,
            email,
            referralCode: Math.random().toString(36).substring(2),
            referredBy: referredByUser ? referredByUser._id : null,
            earnings: 0,
        });
        if (referredByUser) {
            referredByUser.referrals.push(user._id);
            yield referredByUser.save();
        }
        res.json({ message: "User created successfully", user });
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
}));
app.post("/transaction", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, amount } = req.body;
        const user = yield db_1.userModel.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        let totalSpent = 0;
        if (amount > 1000) {
            let UserreferredBy = user.referredBy
                ? yield db_1.userModel.findById(user.referredBy)
                : null;
            if (UserreferredBy) {
                UserreferredBy.earnings += amount * 0.05;
                totalSpent += amount * 0.05;
                yield UserreferredBy.save();
            }
            if (UserreferredBy === null || UserreferredBy === void 0 ? void 0 : UserreferredBy.referredBy) {
                const UserreferredBy2 = yield db_1.userModel.findById(UserreferredBy.referredBy);
                if (UserreferredBy2) {
                    UserreferredBy2.earnings += amount * 0.01;
                    totalSpent += amount * 0.01;
                    yield UserreferredBy2.save();
                }
            }
        }
        user.earnings += amount - totalSpent;
        yield db_1.transactionModel.create({
            user: user._id,
            amount,
            earningsDistributed: totalSpent > 0,
            date: new Date(),
        });
        yield user.save();
        res.json({ message: "Transaction successful", user });
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
}));
app.delete("/user/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db_1.userModel.findById(req.params.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        yield db_1.userModel.findByIdAndDelete(req.params.userId);
        res.json({ message: "User deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
}));
app.get("/transactions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactions = yield db_1.transactionModel.find({});
        res.json({ transactions });
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
}));
app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
