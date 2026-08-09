class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(statusCode: number, message: string) {
        super(message);

        this.statusCode = statusCode;

        // This flag tells our middleware: "This is an expected error, safe to show the user."
        this.isOperational = true;

        // Capture the stack trace (useful for debugging)
        Error.captureStackTrace(this, this.constructor);
    }
}

export = AppError;