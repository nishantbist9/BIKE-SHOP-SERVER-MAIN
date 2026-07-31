import { USER_ROLE } from "../User/user.constant";

export type TRegisterUser = {
  name: string; // Full name of the user
  email: string; // Email for authentication
  password: string; // Password for the user
  role?: keyof typeof USER_ROLE; // Optional role, defaults to "customer"
};

export type TLoginUser = {
  email: string; // User's email for login
  password: string; // User's password for login
};

// export type TLoginUser = {
//   id: string;
//   password: string;
// };

