import { NextFunction, Response, Request } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary"
import { createCourse } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import ejs from 'ejs'
import path from "path";
import sendMail from "../utils/sendMail";

// Upload course
export const uploadCourse = CatchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail,{
                folder: 'courses',
            });

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }
        createCourse(data, res, next);
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

//  Edit course
export const editCourse = CatchAsyncError(async (req:Request, res:Response, next: NextFunction) => {
    try {
        const data = req.body;

        const thumbnail = data.thumbnail;

        if(thumbnail) {
            await cloudinary.v2.uploader.destroy(thumbnail.public_id);

            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: 'courses',
            })

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }

        const courseId = req.params.id;

        const course = await CourseModel.findByIdAndUpdate(
            courseId,
            {
                $set: data,
            },
            {new: true}
        )

        res.status(201).json({
            success: true,
            course,
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
})


// get Single Cource  --- Without purchasing
export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;

        const isCacheExist = await redis.get(courseId)
        if(isCacheExist) {
            const course = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                course,
            })
        } else{
            const course = await CourseModel.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links")

            res.status(201).json({
                success: true,
                course,
            })
        }

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// get All courses  --- Without purchasing
export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;

        const isCacheExist = await redis.get(courseId)
        
        // const isCacheExist = await redis.get("allCourses");

        if(isCacheExist) {
            const courses = JSON.parse(isCacheExist);

            res.status(201).json({
                success: true,
                courses,
            })
        } else {
            const courses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links")

            await redis.set("allCourses", JSON.stringify(courses));

            res.status(201).json({
                success: true,
                courses,
            })
        }

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// Get Course constent -- only for valid user
export const getCourseByUser = CatchAsyncError(async (req: Request, res: Response, next:NextFunction) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
console.log("userCourseList", userCourseList)
console.log("courseId", courseId)
        const courseExists = userCourseList?.find((course: any) => course._id.toString() === courseId)

        if(!courseExists){
            return next(
                new ErrorHandler("you are not eligible to access this course", 404)
            )
        }

        const course = await CourseModel.findById(courseId);

        const content = course?.courseData

        res.status(200).json({
            success: true,
            content
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
})


// add Question in Course
interface IAddQuestionData{
    question: string,
    courseId: string
    contentId: string
}

export const addQuestion = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {question, courseId, contentId}: IAddQuestionData = req.body;
        const course = await CourseModel.findById(courseId);

        if(!mongoose.Types.ObjectId.isValid(courseId)){
            return next(new ErrorHandler("Invalid Content id", 400))
        }

        const courseContent = course?.courseData?.find((item:any) =>  item._id.equals(contentId));

        if(!courseContent){
            return next(new ErrorHandler("Invalid content id", 400))
        }

        // Create a new question object
        const newQuestion:any = {
            user: req.user,
            question,
            questionReplies:[]
        }

        // Add this question to our course content list
        courseContent.questions.push(newQuestion);

        // Save the uploaded course
        await course?.save()

        res.status(200).json({
            success: true,
            course
        })

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// add answer in course question
interface IAddAnswerData {
    answer:string
    courseId:string
    contentId:string
    questionId:string
}

export const addAnswer = CatchAsyncError(async ( req: Request, res: Response, next: NextFunction) => {
    try {
        const {answer, courseId, contentId, questionId}: IAddAnswerData = req.body;

        const course = await CourseModel.findById(courseId);
        
        if(!mongoose.Types.ObjectId.isValid(courseId)){
            return next(new ErrorHandler("Invalid Content id", 400))
        }

        const courseContent = course?.courseData?.find((item: any) =>  item._id.equals(contentId));

        if(!courseContent){
            return next(new ErrorHandler("Invalid content id", 400))
        }

        const question = courseContent?.questions?.find((item: any) => 
            item._id.equals(questionId)
        )

        if(!question){
            return next(new ErrorHandler("Invalid question id", 400));
        }

        // Craete a new answer object
        const newAnswer: any = {
            user: req.user,
            answer,
        }

        //  add this answer to our course content
        question.questionReplies.push(newAnswer);

        await course?.save();

        if(req.user?._id === question.user._id){
            // craete a notifixatinon
        } else {
            const data = {
                name: question.user.name,
                title: courseContent.title,
            }
            // send a notification to the user who asked the question
            const html = await ejs.renderFile(path.join(__dirname, "../mails/question-reply.ejs"), data)
            
            try {
                await sendMail({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "question-reply.ejs",
                    data
                })
            } catch (error:any) {
                return next(new ErrorHandler(error.message, 500));
            }
        }

        res.status(200).json({
            success: true,
            course
        })

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

//  add review in course
interface IAddReviewData {
    review: string
    rating: number
    userId: string
}

export const addReview = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        //check if courseId already exists in userCourseList based on _id
        const courseExists = userCourseList?.some((course:any) => course._id.toString() === courseId.toString());

        if(!courseExists){
            return next(new ErrorHandler("You are not eligible to access this course", 404));
        }

        const course = await CourseModel.findById(courseId);

        const {review, rating} = req.body as IAddReviewData;

        const reviewData:any = {
            user:req.user,
            comment: review,
            rating,
        }

        course?.reviews.push(reviewData);

        let avg = 0

        course?.reviews.forEach((rev:any) => {
            avg += rev.rating;
        })

        if(course){
            course.ratings = avg / course.reviews.length;  // one example we have 2 reviews  9 / 2 = 4.5
        }

        await course?.save();

        const notification = {
            title: "New Review Added",
            message: `${req.user?.name} has given a review to ${course?.name}`
        }

        // create a notification        
        
        res.status(200).json({
            success: true,
            course
        })


    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// add reply in review
interface IAddReviewData{
    comment:string
    courseId:string
    reviewId:string
}
export const addReplyToReview = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {comment, courseId, reviewId} = req.body as IAddReviewData;

        const course = await CourseModel.findById(courseId);

        if(!course){
            return next(new ErrorHandler("Course not found", 400))
        }

        const review = course?.reviews?.find((rev:any) => rev._id.toString() === reviewId);

        if(!review){
            return next(new ErrorHandler("Review not found", 404))
        }

        const replyData:any = {
            user: req.user,
            comment
        }

        if(!review.commentReplies){
            review.commentReplies = []
        }

        review.commentReplies?.push(replyData);

        await course?.save();

        res.status(200).json({
            success: true,
            course
        })

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
})