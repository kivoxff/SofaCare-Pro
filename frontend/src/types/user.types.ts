export interface IUser {
    id: string;
    fullName: string;
    email: string;
    role: "Customer" | "Field_Cleaner" | "Manager" | "Owner";
    profileImage: string;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    data: IUser;
}

export interface LoginResponse extends RegisterResponse {

}

export interface UserResponse extends LoginResponse {

}

export interface LogoutResponse {
    success: boolean;
    message: string;
}

export interface UsersResponse {
    success: boolean;
    message: string;
    data: IUser[];
}