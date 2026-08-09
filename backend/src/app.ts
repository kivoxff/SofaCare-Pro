import express = require("express");
import cookieParser = require("cookie-parser");
import type { Application, Request, Response, NextFunction } from "express";
import cors = require("cors");
import environment = require("./config/env");

import notFoundHandler = require("./middleware/notFound.middleware");
import errorHandler = require("./middleware/error.middleware");
import authRouter = require("./routes/auth.routes");
import authMiddleware = require("./middleware/auth.middleware");
import userRouter = require("./routes/user.routes");
import orderRouter = require("./routes/order.routes");

const app: Application = express();

app.use(cors({
    origin: environment.appUrl,
    credentials: true
}))

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter)
app.use("/api/orders", orderRouter);

app.get("/api/up", authMiddleware.requireAuth, authMiddleware.requireRole(["Owner"]), (req: Request, res: Response, next: NextFunction) => {
    res.json({
        success: true,
        message: "Server is running..."
    });
});

app.use(notFoundHandler);
app.use(errorHandler);

export = app;