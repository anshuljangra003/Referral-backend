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
const zod_1 = require("zod");
// @ts-ignore
const index_js_1 = require("../../ws-backend/dist/index.js");
const userSchema = zod_1.z.object({
    name: zod_1.z.string().nonempty(),
    email: zod_1.z.string().email(),
    referralCode: zod_1.z.string().optional(),
});
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield db_1.userModel.find({});
    res.json({
        users,
    });
}));
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, referralCode } = req.body;
    let referredByUser = null;
    if (referralCode) {
        referredByUser = yield db_1.userModel.findOne({ referralCode });
    }
    const { success } = userSchema.safeParse(req.body);
    if (!success) {
        res.status(411).json({
            message: "Invalid INPUT TYPE",
        });
    }
    const user = yield db_1.userModel.create({
        name,
        email,
        referralCode: Math.random().toString(36),
        referredBy: referredByUser ? referredByUser._id : null,
        earnings: 0,
    });
    if (referredByUser) {
        referredByUser.referrals.push(user._id);
        yield referredByUser.save();
    }
    res.json({
        message: "user created successfully",
        user,
    });
}));
app.post("/refer", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
}));
app.post("/transaction", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, amount } = req.body;
    const user = yield db_1.userModel.findOne({ email });
    if (!user) {
        res.status(404).json({
            message: "user not found",
        });
    }
    let totalSpent = 0;
    if (amount > 1000) {
        let UserreferredBy = user.referredBy;
        if (UserreferredBy) {
            UserreferredBy = yield db_1.userModel.findOne(user.referredBy);
            UserreferredBy.earnings += amount * 0.05;
            totalSpent += amount * 0.05;
            // ws call
            (0, index_js_1.notifyUser)(UserreferredBy._id.toString(), UserreferredBy.earnings);
            yield UserreferredBy.save();
        }
        if (UserreferredBy.referredBy) {
            const UserreferredBy2 = yield db_1.userModel.findOne(UserreferredBy.referredBy);
            UserreferredBy2.earnings += amount * 0.01;
            totalSpent += amount * 0.01;
            (0, index_js_1.notifyUser)(UserreferredBy2._id.toString(), UserreferredBy2.earnings);
            yield UserreferredBy2.save();
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
    res.json({
        message: "transaction successful",
    });
}));
app.get("/transactions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield db_1.transactionModel.find({});
    res.json({
        transactions
    });
}));
app.listen(3000);
