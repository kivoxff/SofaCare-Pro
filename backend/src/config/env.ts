import dotenv = require("dotenv");
dotenv.config();

if (!process.env.MONGO_URL) throw new Error("MONGO_URL is missing!");
if (!process.env.IMAGE_KIT_PRIVATE_KEY) throw new Error("IMAGE_KIT_PRIVATE_KEY is missing!");
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing!");

interface Environment {
    port: number;
    mongoUrl: string;
    imgKitPrivateKey: string;
    jwtSecret: string
}

const environment: Environment = {
    port: Number(process.env.PORT) || 3000,
    mongoUrl: process.env.MONGO_URL,
    imgKitPrivateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
    jwtSecret: process.env.JWT_SECRET
}

export = environment;