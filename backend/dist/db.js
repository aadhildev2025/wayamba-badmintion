"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    if (mongoose_1.default.connection.readyState >= 1) {
        return;
    }
    try {
        const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wayamba_badminton';
        console.log('Connecting to MongoDB...');
        await mongoose_1.default.connect(connUri);
        console.log('MongoDB Connected successfully!');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};
exports.connectDB = connectDB;
