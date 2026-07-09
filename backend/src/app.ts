import express = require("express");
import cookieParser = require("cookie-parser");
import type { Application, Request, Response, NextFunction } from "express";

import notFoundHandler = require("./middleware/notFound.middleware");
import errorHandler = require("./middleware/error.middleware");
import authRouter = require("./routes/auth.routes");
import authMiddleware = require("./middleware/auth.middleware");
import userRouter = require("./routes/user.routes");
import requestRouter = require("./routes/request.routes");

const app: Application = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter)
app.use("/api/requests", requestRouter);

app.get("/api/health", authMiddleware.requireAuth, authMiddleware.requireRole(["Owner"]), (req: Request, res: Response, next: NextFunction) => {
    res.json({
        success: true,
        message: "Server is running..."
    });
});

app.use(notFoundHandler);
app.use(errorHandler);

export = app;