import mongoose = require("mongoose");
import { type Mongoose } from "mongoose"
import environment = require("./env");
import dns = require("node:dns")

// Force Node to use Cloudflare and Google public DNS
dns.setServers(['1.1.1.1', '8.8.8.8']);

const connectDB = async (): Promise<void> => {
    try {
        const conn: Mongoose = await mongoose.connect(environment.mongodbUrl);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1); // Exit process with failure
    }
}

export = connectDB;