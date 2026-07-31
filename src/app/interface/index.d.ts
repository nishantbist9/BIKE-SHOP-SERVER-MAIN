// import { JwtPayload } from 'jsonwebtoken';
import { TUser } from '../modules/User/user.interface';

declare global {
  namespace Express {
    interface Request {
      // user: JwtPayload;
      user: TUser;
      socketAuthToken: string;
    }
  }
}
