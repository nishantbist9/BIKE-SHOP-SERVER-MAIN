import { NextFunction, Request, Response } from 'express';
import httpStatus from "http-status";

// const notFound = (req: Request, res: Response) => {
//   res.status(404).json({
//     success: false,
//     message: `Cannot ${req.method} ${req.originalUrl}`,
//   });
// };


const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API Not Found !!",
    error: "",
  });
  next();
};


export default notFound;
