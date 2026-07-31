import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { AuthServices } from './auth.service';
import catchAsync from '../../utils/catchAsync';
import { USER_ROLE } from '../User/user.constant';

// const loginUser = catchAsync(async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   // Authenticate user and get tokens
//   const { accessToken, refreshToken, needsPasswordChange } =
//     await AuthServices.loginUser({
//       email,
//       password,
//     });

//   res.status(httpStatus.OK).json({
//     success: true,
//     message: 'Login successful',
//     statusCode: 200,
//     data: {
//       token: accessToken,
//       refreshToken, // Optional: Return if you use refresh tokens
//       needsPasswordChange, // Optional: Indicate if the user needs to change their password
//     },
//   });
// });


const registerUser = catchAsync(async (req, res) => {
  const user = await AuthServices.registerUser(req.body);

  // const user  = req.body;
  // const result = await AuthServices.registerUser(user);
  // console.log('f-aCTRL',result);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User registered successfully',
    statusCode: httpStatus.CREATED,
    data: user,
    // data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(req.body);
  // Authenticate user/admin and get tokens
  // const { accessToken, needsPasswordChange } =
  const { accessToken, needsPasswordChange, role } =
    await AuthServices.loginUser({
      email,
      password,
    });

  res.status(httpStatus.OK).json({
    success: true,
    message: role === USER_ROLE.admin ? 'Admin login successful' : 'Login successful',
    statusCode: 200,
    data: {
      token: accessToken,
      // refreshToken, // Optional: Return if you use refresh tokens
      needsPasswordChange, // Optional: Indicate if the user needs to change their password
      role, // Return the role (user/admin)
    },
  });
});


// const refreshToken = catchAsync(async (req, res) => {
//   const { refreshToken } = req.cookies;
//   const result = await AuthServices.refreshToken(refreshToken);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Access token is retrieved successfully!',
//     data: result,
//   });
// });

export const AuthController = {
  loginUser,
  registerUser,
};
