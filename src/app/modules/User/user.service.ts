// import { User } from './user.interface'; // Import the user interface
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { TUser } from './user.interface'; // Import the user interface
import { User } from './user.model';
import mongoose from 'mongoose';
import { createToken } from '../Auth/auth.utils';
import httpStatus from "http-status";
import bcrypt from 'bcrypt';

// Create a new user in the database
// const createUserInDB = async (user: TUser): Promise<TUser> => {
//   const result = await User.create(user); // Create user using the UserModel
//   return result;
// };

const createUserInDB = async (payload: TUser) => {
  if (!payload) {
    throw new AppError(404, 'User is undefined or null');
  }

  const existingUser = await User.findOne({ email: payload.email });

  payload.role = 'customer'

  if (existingUser) {
    throw new AppError(404, 'Email already exists');
  }
  const user = await User.create(payload);
  const jwtPayload = {
    userId: user?.id,
    email: user?.email,
    role: "customer",
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    String(config.jwt_access_expires_in)
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    String(config.jwt_access_expires_in)
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: TUser) => {
  const user = await User.isUserExistsById(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "email is not register")
  }

  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, "user is blocked")
  }

  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, "Password do not matched");
  }

  const jwtPayload = {
    userId: user?.id,
    email: user?.email ?? "default_email",
    role: user?.role ?? "user",
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

// Retrieve all users from the database with optional query filtering
const getAllUsersFromDB = async (
  query: Record<string, unknown> = {},
): Promise<TUser[]> => {
  const result = await User.find(query); // Find users with optional filters
  return result;
};

// Retrieve a single user by ID from the database
const getSingleUserFromDB = async (id: string): Promise<TUser | null> => {
  const result = await User.findById(id); // Find user by ID
  if (!result) {
    throw new AppError(404, 'User not found'); // Handle user not found
  }
  return result;
};

// Update a user in the database by ID
// const updateUserInDB = async (
//   id: string,
//   payload: Partial<TUser>,
// ): Promise<TUser | null> => {
//   const result = await User.findByIdAndUpdate(id, payload, {
//     new: true, // Return the updated document
//     runValidators: true, // Run schema validators
//   });
//   if (!result) {
//     throw new AppError(404, 'User not found for update');
//   }
//   return result;
// };
const updateUserInDB = async (
  userData: JwtPayload,
  payload: { name?: string; phone_number?: string; address?: string }
) => {
  // Check if user exists
  // const user = await User.findOne({ email: userData.email });
  console.log('f-us, userData:',userData);
  const user = await User.isUserExistsById(userData.email);
  console.log('f-us,payload:',payload);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Prevent updates for blocked users
  if (user.status === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked!");
  }

  // Update user fields if provided
  if (payload.name) user.name = payload.name;
  if (payload.phone_number) user.phone_number = payload.phone_number;
  if (payload.address) user.address = payload.address;

  // Save updated user
  await user.save();

  return user;
};

// Soft delete a user by marking them as deleted
const deleteUserFromDB = async (id: string): Promise<TUser | null> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const deletedUser = await User.findByIdAndUpdate(
      id,
      { isDeleted: true }, // Soft delete by setting `isDeleted` to true
      { new: true, session },
    );

    if (!deletedUser) {
      throw new AppError(404, 'User not found for deletion');
    }

    await session.commitTransaction();
    return deletedUser;
  } catch (error) {
    await session.abortTransaction();
    console.error('Transaction Error:', error);
    throw new AppError(400, 'Failed to delete user');
  } finally {
    session.endSession();
  }
};

const blockUserInDB = async (id: string): Promise<TUser | null> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const blockedUser = await User.findByIdAndUpdate(
      id,
      // { status: "blocked"  },
      // { isBlocked: true, status: "blocked" }, // Soft delete by setting `isDeleted` to true
      { isBlocked: true }, // Soft block by setting `isDeleted` to true
      { new: true, session },
    );

    if (!blockedUser) {
      throw new AppError(404, 'User not found for blocking');
    }

    await session.commitTransaction();
    return blockedUser;
  } catch (error) {
    await session.abortTransaction();
    console.error('Transaction Error:', error);
    throw new AppError(400, 'Failed to block user');
  } finally {
    session.endSession();
  }
};


const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {

  const user = await User.isUserExistsById(userData.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      email: userData.email,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );

  return null;
};


const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string,
  ) as JwtPayload;

  const { email } = decoded;

  // checking if the user is exist
  // const user = await UserModel.isUserExistsById(email);
  const user = await User.isUserExistsById(email);

  const jwtPayload = {
    userId: user?.id,
    email: user?.email,
    role: user?.role,
  };

  // console.log(jwtPayload)

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};


// Export the user services
export const UserServices = {
  createUserInDB,
  loginUser,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserInDB,
  deleteUserFromDB,
  blockUserInDB,
  refreshToken,
  changePassword,
};
