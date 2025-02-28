import { CatchAsyncError } from './../middleware/catchAsyncErrors';
import { accessTokenOptions, refreshTokenOptions, sendToken } from './../utils/jwt';
require('dotenv').config()
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from 'ejs';
import path from "path";
import sendMail from "../utils/sendMail";
import { redis } from '../utils/redis';
import { getAllUsersService, getUserById, updateUserRoleService } from '../services/user.service';
import cloudinary from 'cloudinary';
import CourseModel from '../models/course.model';

// register user
interface IRegistrationBody{
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export const registrationUser = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name, email, password} = req.body;

        const isEmailExist = await userModel.findOne({email});
        if (isEmailExist) {
            return next(new ErrorHandler("Email already exists", 400));
        };

        const user:IRegistrationBody = {
            name, 
            email, 
            password,
        }

        const activationToken = createActivationToken(user);

        const activationCode = activationToken.activationCode;

        const data = { user: {name: user.name}, activationCode };
        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data)

        try {
            await sendMail({
                email: user.email,
                subject: "Activate your account",
                template: "activation-mail.ejs",
                data,
            })

            res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email} to activate your account`,
                activationToken: activationToken.token,
            })
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    } 
     catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

interface IActivationToken{
    token: string;
    activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const token = jwt.sign({
        user, activationCode
    },
    process.env.ACTIVATION_SECRET as Secret, 
    {
        expiresIn: "5m",
    });

    return {token, activationCode};
}

// Activate User
interface IActivationRequest {
    activation_token: string;
    activation_code: string;
}

export const activateUser = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {activation_token, activation_code} = req.body as IActivationRequest;

        const newUser: {user: IUser; activationCode:string} = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
        ) as {user: IUser; activationCode:string};

        if(newUser.activationCode !== activation_code) {
            return next(new ErrorHandler('Invalid activation code', 400))
        }

        const {name, email, password} = newUser.user;

        const existUser = await userModel.findOne({email});

        if(existUser){
            return next(new ErrorHandler("Email already exists", 400));
        }
        const user = await userModel.create({
            name,
            email,
            password,
        })

        res.status(200).send({
            success: true,
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

// Login user
interface ILoginRequest {
    email: string;
    password: string;
}

export const loginUser = CatchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    try {
        const {email, password} = req.body as ILoginRequest;

        if(!email || !password){
            return next(new ErrorHandler("All fields are required", 400))
        }

        const user = await userModel.findOne({email}).select("+password")

        if(!user){
            return next(new ErrorHandler("Invalid email or password", 400))
        }

        const isPasswordMatch = await user.comparePassword(password)
        if(!isPasswordMatch){
            return next(new ErrorHandler("Invalid email or password", 400));
        }

        sendToken(user, 200, res);

    } catch (error:any) {
        return next(new ErrorHandler(error.message,400))
    }
})


// User Logout
export const logoutUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Clear cookies
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });

        // Get user ID and validate
        // const userId = req.user?._id?.toString() || ""; // Ensure _id is a string
        // if (!userId) {
            //     return next(new ErrorHandler("User ID is missing", 400));
            // }
            
            // Delete session from Redis
        const userId = req.user?._id?.toString() || ""; // Ensure _id is a string
        await redis.del(userId);

        // Respond to the client
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});


// update  access token
export const updateAccessToken = CatchAsyncError(async(req: Request, res: Response, next:NextFunction) => {
    try {
        const refresh_token = req.cookies.refresh_token as string;
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;

        const message = 'Could not refresh token';
        if (!decoded) {
            return next(new ErrorHandler(message, 400));
        }
        const session = await redis.get(decoded.id as string);

        if (!session) {
            return next(new ErrorHandler('Please Login for access this resources!', 400));
        }

        const user = JSON.parse(session);

        const accessToken = jwt.sign({id: user._id}, process.env.ACCESS_TOKEN as string, {
            expiresIn: "5m",
        })

        const refreshToken = jwt.sign({id: user._id}, process.env.REFRESH_TOKEN as string, {
            expiresIn: "7d"
        })

        req.user = user;

        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);

        await redis.set(user._id, JSON.stringify(user), "EX", 604800);  // 7 days expires

        res.status(200).json({
            status: 'success',
            accessToken,
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})


// get user information
export const getUserInfo = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id as string; // Explicitly cast _id to string
        if (!userId) {
            return next(new ErrorHandler("User ID is missing", 400));
        }

        // Call the function to get user by ID
        await getUserById(userId, res);

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

interface ISocialAuthBody {
    email: string;
    name: string;
    avatar: string;
}

// social auth
export const socialAuth = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, name, avatar} = req.body as ISocialAuthBody;
        const user = await userModel.findOne({email})
        if (!user) {
            // Create a new user
            const newUser = await userModel.create({email, name, avatar})
            sendToken(newUser, 200, res)
        }
        else {
            sendToken(user, 200, res)
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})


//update user information
interface IUpdateUserInfo {
    name?: string;
    email?: string;
}

export const updateUserInfo = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {name} = req.body as IUpdateUserInfo;
        const userId = req.user?._id;

        // Ensure userId exists and is a string
        if (!userId || typeof userId !== "string") {
            return next(new ErrorHandler("Invalid or missing User ID", 400));
        }

        const user = await userModel.findById(userId)

        // if (email && user) {
        //     const isEmailExist = await userModel.findOne({email});
        //     if (isEmailExist) {
        //         return next(new ErrorHandler("Email already exists", 400));
        //     }
        //     user.email = email
        // }

        if (name && user) {
            user.name = name 
        }

        await user?.save();

        await redis.set(userId, JSON.stringify(user));

        res.status(201).json({
            success: true,
            user
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})


//update user password
interface IUpdatePassword {
    oldPassword: string;
    newPassword: string;
}

export const updatePassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { oldPassword, newPassword } = req.body as IUpdatePassword;

        if (!oldPassword || !newPassword) {
            return next(new ErrorHandler("Please provide both old and new password", 400));
        }

        // Validate userId
        const userId = req.user?._id;
        if (!userId || typeof userId !== "string") {
            return next(new ErrorHandler("Invalid or missing User ID", 400));
        }

        // Find user and include password
        const user = await userModel.findById(userId).select("+password");

        if (!user || user.password === undefined) {
            return next(new ErrorHandler("Invalid user", 400));
        }

        // Check if old password matches
        const isPasswordMatch = await user.comparePassword(oldPassword);
        if (!isPasswordMatch) {
            return next(new ErrorHandler("Invalid old Password", 400));
        }

        // Update the password
        user.password = newPassword;
        await user.save();

        // Update Redis with the new user data
        await redis.set(userId, JSON.stringify(user));

        // Send response
        res.status(201).json({
            success: true,
            message: "Password updated successfully",
            user,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});


// update profile picture and avatar

interface IUpdateProfilePicture {
    avatar: string;
}

export const updateProfilePicture = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { avatar } = req.body;

        // Validate userId
        const userId = req.user?._id;
        if (!userId || typeof userId !== "string") {
            return next(new ErrorHandler("Invalid or missing User ID", 400));
        }

        // Find the user
        const user = await userModel.findById(userId);

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        if (avatar) {
            if (user?.avatar?.public_id) {
                // Delete the old image from Cloudinary
                await cloudinary.v2.uploader.destroy(user.avatar.public_id);
            }

            // Upload the new image to Cloudinary
            const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                folder: "avatars",
                width: 150,
            });

            // Update user's avatar information
            user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }

        // Save the updated user
        await user.save();

        // Update the user in Redis
        await redis.set(userId, JSON.stringify(user));

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});


//  get all users --- only for admin
export const getAllUsers = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        getAllUsersService(res)
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

// update user role -- only for admin
export const updateUserRole = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {id, role} = req.body;
        updateUserRoleService(res, id, role)
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
}) 


//Delete user -- only for admin
export const deleteUser = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params;

        const user = await userModel.findById(id)

        if(!user){
            return next(new ErrorHandler("User not found", 404))
        }

        await user.deleteOne({id});

        await redis.del(id);
        
        res.status(200).json({
            success: true,
            message: "User deleted Successfuly",
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})


//Delete course -- only for admin
export const deleteCourse = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params;

        const course = await CourseModel.findById(id)

        if(!course){
            return next(new ErrorHandler("Course not found", 404))
        }

        await course.deleteOne({id});

        await redis.del(id);
        
        res.status(200).json({
            success: true,
            message: "Course deleted Successfuly",
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})