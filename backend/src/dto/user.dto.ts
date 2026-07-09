import { type Role } from "../types/user.interface";

export interface UserResponseDTO {
    id: string;
    email: string;
    fullName: string;
    role: Role;
}