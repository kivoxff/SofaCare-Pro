import dotenv = require("dotenv");
dotenv.config();

if (!process.env.MONGODB_URL) throw new Error("MONGODB_URL is missing!");
if (!process.env.IMAGE_KIT_PRIVATE_KEY) throw new Error("IMAGE_KIT_PRIVATE_KEY is missing!");
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing!");
if (!process.env.APP_URL) throw new Error("APP_URL is missing!");
if (!process.env.COOKIE_SECURE) throw new Error("COOKIE_SECURE is missing!");
if (!process.env.COOKIE_SAMESITE || (process.env.COOKIE_SAMESITE !== "strict" && process.env.COOKIE_SAMESITE !== "lax" && process.env.COOKIE_SAMESITE !== "none")) throw new Error("COOKIE_SAMESITE is missing or invalid!");

interface Environment {
    port: number;
    mongodbUrl: string;
    imgKitPrivateKey: string;
    jwtSecret: string;
    appUrl: string;
    cookieSecure: boolean;
    cookieSameSite: "strict" | "lax" | "none";
}

const environment: Environment = {
    port: Number(process.env.PORT) || 3000,
    mongodbUrl: process.env.MONGODB_URL,
    imgKitPrivateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
    jwtSecret: process.env.JWT_SECRET,
    appUrl: process.env.APP_URL,
    cookieSecure: process.env.COOKIE_SECURE === "true",
    cookieSameSite: process.env.COOKIE_SAMESITE
}

export = environment;