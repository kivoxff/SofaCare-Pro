import { type RequestHandler } from "express";

const notFoundHandler: RequestHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route Not Found - ${req.originalUrl}`
    })
}

export = notFoundHandler;