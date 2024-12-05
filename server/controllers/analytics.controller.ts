import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { generateLast12MonthsData } from "../utils/analytics.generator";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import OrderModel from "../models/orderModel";


//  Get users analysis ----  only for admin
export const getUsersAnalytics = CatchAsyncError(async (req: Request, res: Response, next:NextFunction) => {
    try {
        const users = await generateLast12MonthsData(userModel);

        res.status(200).json({
            success: true,
            users
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

//  Get Courses analysis ----  only for admin
export const getCoursesAnalytics = CatchAsyncError(async (req: Request, res: Response, next:NextFunction) => {
    try {
        const courses = await generateLast12MonthsData(CourseModel);

        res.status(200).json({
            success: true,
            courses
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

//  Get Order analysis ----  only for admin
export const getOrderAnalytics = CatchAsyncError(async (req: Request, res: Response, next:NextFunction) => {
    try {
        const orders = await generateLast12MonthsData(OrderModel);

        res.status(200).json({
            success: true,
            orders
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
    }
})