// import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

// export const createToken = (
//   jwtPayload: { userId: string; role: string },
//   secret: string,
//   expiresIn: string | number // Allow both string and number for expiresIn
// ) => {
//   const options: SignOptions = {
//     expiresIn: expiresIn as SignOptions['expiresIn'], // Explicitly cast expiresIn
//   };

//   return jwt.sign(jwtPayload, secret, options);
// };

// export const verifyToken = (token: string, secret: string) => {
//   return jwt.verify(token, secret) as JwtPayload;
// };

import jwt, { JwtPayload } from 'jsonwebtoken';

export const createToken = (
  jwtPayload: { userId: string; role: string },
  secret: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  expiresIn: string,
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn: '2d',
  });
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
