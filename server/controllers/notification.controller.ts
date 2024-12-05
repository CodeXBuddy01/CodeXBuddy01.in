import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import NotificationModel from "../models/notificationModel";
import cron from "node-cron"


//  get all notification  ---- only admin
export const getNotifications = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notifications = await NotificationModel.find().sort({createdAt: -1})

        res.status(200).json({
            success: true,
            notifications,
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

//  update notification ---- only admin
export const updateNotification = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await NotificationModel.findById(req.params.id);
        if(!notification){
            return next(new ErrorHandler("Notification not found", 404));
        } else {
            notification.status
            ? (notification.status = "read")
            : notification?.status;
        }

        await notification.save()

        const notifications = await NotificationModel.find().sort({
            createdAt: -1
        })

        res.status(201).json({
            success: true,
            notifications,
        })
        
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
    }
});


// Delete notification ---- only admin
// cron.schedule("*/5 * * * * *", function() {
//     console.log("---------------")
//     console.log("Running cron")
// })

cron.schedule("0 0 0 * * *", async() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await NotificationModel.deleteMany({status:"read", createdAt: {$lt: thirtyDaysAgo}});
    console.log("Deleted read notification")
})