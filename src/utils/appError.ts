interface IMongooseError {
    path?: string;
    value?: any;
}

class AppError extends Error implements IMongooseError {
    public statusCode: number;
    public isOperational: boolean;
    public status: string;
    public code?: number;
    public path?: string;
    public value?: any;

    constructor(message: string, statusCode: number) {
        super();

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.message = message;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError