import { NextFunction, Request, Response } from "express";

export const CatchAsyncError = (theFunc: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(theFunc(req, res, next)).catch(next);
    }
}