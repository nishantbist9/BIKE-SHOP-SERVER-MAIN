import { Document, Model } from 'mongoose';
import { USER_ROLE } from './user.constant';

// export interface TUser {
export interface TUser extends Document {
  // id?: string;
  name: string;
  email: string;
  password: string;
  profileImg?: string;
  // phone?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  role: 'admin' | 'customer';
  status?: 'active' | 'blocked';
  isBlocked: boolean;
  isDeleted: boolean;
  // createdAt: Date;
  // updatedAt: Date;
}

export interface UserModel extends Model<TUser> {
  isUserExistsById(id: string): Promise<TUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;
