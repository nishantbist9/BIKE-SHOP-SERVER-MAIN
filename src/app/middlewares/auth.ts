import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import { TUserRole } from '../modules/User/user.interface';
import { User } from '../modules/User/user.model';
import catchAsync from '../utils/catchAsync';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    // const token = req.headers.authorization?.split(' ')[1];

    // checking if the token is missing
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    // checking if the given token is valid
    // const decoded = jwt.verify(
    //   token,
    //   config.jwt_access_secret as string,
    // ) as JwtPayload;

    // Verify the token
    // let decoded: JwtPayload & { role?: string; userId?: string; iat?: number };
    // try {
    //   decoded = jwt.verify(
    //     token,
    //     config.jwt_access_secret as string
    //   ) as JwtPayload & { role?: string; userId?: string; iat?: number };
    // } catch (err) {
    //   throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired token!');
    //   console.log(err);
    // }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'unauthorized');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { role, email, userId, iat } = decoded;
    
    // const { role, email } = decoded;

    // checking if the user exists in DB
    // const user = await User.findOne({ email });

    // const user = await User.findOne({email});
    // const user = await User.findById(userId);
    const user = await User.isUserExistsById(email);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
    }

    const isDeleted = user?.isDeleted;

    if (isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
    }

    // checking if the user is blocked
    const userStatus = user?.status;

    if (userStatus === 'blocked') {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
    }

    // Check if the token was issued before the user's password was changed
    // if (
    //   user.passwordChangedAt &&
    //   user.passwordChangedAt.getTime() / 1000 > (iat || 0)
    // ) {
    //   throw new AppError(
    //     httpStatus.UNAUTHORIZED,
    //     'Token is invalid as the password has been changed!'
    //   );
    // }

    // Check if the user's role matches the required roles
    if (requiredRoles.length && !requiredRoles.includes(role as TUserRole)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You do not have the required permissions!'
      );
    }

    // req.user = decoded as JwtPayload & { role: string };
    req.user = user;
    next();
  });
};

export default auth;
