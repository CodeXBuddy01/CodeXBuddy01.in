require('dotenv').config()
import express, { NextFunction, Request, Response } from 'express';
export const app = express();
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ErrorMiddleware } from './middleware/error';
import userRouter from './routes/user.route';

// Body parser
app.use(express.json({limit: "50mb"}))

// cookies parser
app.use(cookieParser())

// Routes
app.use("/api/v1", userRouter)

// // cors => cross origin resource sharing
app.use(cors({
    origin: process.env.ORIGIN
}))

// //Fixed it using gpt
// app.use(cors({
//     origin: process.env.ORIGIN?.split(',') // Support multiple origins as a comma-separated string
// }));

// Testing API
app.get("/test", (req:Request, res:Response, next:NextFunction) => {
    res.status(200).json({
        success: true,
        message: "API is working"
    })
})

// unknown routes
app.all("*", (req:Request, res:Response, next:NextFunction) => {
    const err = new Error(`Rout ${req.originalUrl} is not found}`) as any;
    err.statusCode = 404
    next(err)
})


app.use(ErrorMiddleware)