import { type Role } from "../types/user.interface";

export interface LoginDTO {
    email: string,
    password: string
}

export interface RegisterDTO extends LoginDTO {
    fullName: string,
    role: Role
    // profileImage is intentionally omitted here as it comes from req.file (Multer), not req.body
}

export interface RegisterResponseDTO {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    profileImage: string | null;
    createdAt: string; // // ISO Date string
}

export interface LoginResponseDTO extends RegisterResponseDTO {
    // token: string;
}