import AppError = require("../utils/AppError");
import { type ErrorRequestHandler } from "express";

// class ErrorHandler {
//     gloabalError: ErrorRequestHandler = function (err, req, res, next) {
//         const statusCode: number = err.statusCode || 500;
//         const message: string = err.message || "Something went wrong!";

//         // Handled error
//         if (err instanceof AppError && err.isOperational) {
//             res.status(statusCode).json({
//                 success: false,
//                 message
//             })
//         } else { // Unexpected error
//             console.error("⚠️ Unhandled Error:", err);

//             res.status(500).json({
//                 success: false,
//                 message: "Internal Server Error"
//             })
//         }
//     }
// }

// export = new ErrorHandler();


const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const statusCode: number = err.statusCode || 500;
    const message: string = err.message || "Something went wrong!";

    // Handled error
    if (err instanceof AppError && err.isOperational) {
        res.status(statusCode).json({
            success: false,
            message
        })
    } else { // Unexpected error
        console.error("⚠️ Unhandled Error:", err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export = errorHandler;