import { type Role } from "../types/user.interface";

export interface LoginDTO {
    email: string,
    password: string
}

export interface RegisterDTO extends LoginDTO {
    fullName: string,
    role: Role
    // profilePicture is intentionally omitted here as it comes from req.file (Multer), not req.body
}

export interface RegisterResponseDTO {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    profilePicture: string | null;
    createdAt: Date;
}

export interface LoginResponseDTO extends RegisterResponseDTO {
    // token: string;
}