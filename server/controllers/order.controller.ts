import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { IOrder } from "../models/orderModel";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import { getAllOrdersService, newOrder } from "../services/order.service";
import ejs from 'ejs'
import path from "path";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notificationModel";
import { Types } from "mongoose";


// create order
export const createOrder = CatchAsyncError(async (req:Request, res:Response, next: NextFunction) => {
    try {
        const {courseId, payment_info} = req.body as IOrder;

        const user = await userModel.findById(req.user?._id)

        const courseExistInUser = user?.courses.some((course:any) => course._id.toString() === courseId);

        if (courseExistInUser) {
            return next(new ErrorHandler("You have already purchased this course", 400));
        }

        const course = await CourseModel.findById(courseId);

        if(!course) {
            return next(new ErrorHandler("Course not found", 400))
        }

        const data:any = {
            courseId: course._id,
            userId: user?._id,
            payment_info,
        }
        

        const mailData = {
            order: {
                // _id: (course._id as string).slice(0, 6), // Assuming _id is a string
                _id: (course._id as Types.ObjectId).toString().slice(0, 6), // Safely converting ObjectId to string and slicing
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString('en-IN', {year: 'numeric', month: 'long', day: 'numeric'})
            }
        }

        const html = await ejs.renderFile(path.join(__dirname, '../mails/order-confirmation.ejs'), {order:mailData})

        try {
            if(user){
                await sendMail({
                    email: user.email,
                    subject: 'Order Confirmation',
                    template: 'order-confirmation.ejs',
                    data: mailData,
                })
            }

            user?.courses.push(course?.id);

            await user?.save();

            await NotificationModel.create({
                user: user?._id,
                title: 'New Order Confirmation',
                message: `You have a New Order from ${course?.name}`
            })


        } catch (error:any) {
            return next(new ErrorHandler(error.message, 500))
        }

        // course.purchased ? course.purchased += 1 : course.purchased;
        // If course.purchased is null or undefined, it defaults to 0, otherwise adds 1.
        course.purchased = (course.purchased ?? 0) + 1;


        await course.save();

        newOrder(data, res, next);

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
    }
})



//  get all orders --- only for admin
export const getAllOrders = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        getAllOrdersService(res)
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})