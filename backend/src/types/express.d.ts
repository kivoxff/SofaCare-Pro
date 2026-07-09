// import { JwtPayload } from 'jsonwebtoken';

// // Define what your JWT payload will look like
// export interface UserPayload extends JwtPayload {
//   id: string;
//   role: string; 
//   email: string;
// }

// // Extend the Express Request interface to include the user object
// declare global {
//   namespace Express {
//     interface Request {
//       user?: UserPayload; // Optional because it does not exists on every request
//     }
//   }
// }