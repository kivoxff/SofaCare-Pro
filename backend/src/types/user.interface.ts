import { type Request } from "express"
import { type Types } from "mongoose";

export type Role = "Customer" | "Field_Cleaner" | "Manager" | "Owner"

export interface IUser {
    fullName: string,
    email: string,
    password: string,
    profilePicture: string | null
    role: Role
}

export interface RequestWithUser extends Request {
    user?: { // Optional as not every request contains 'user'
        id: string;
        email: string;
        role: Role;
    };
}