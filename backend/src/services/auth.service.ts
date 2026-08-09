import type { RegisterDTO, LoginDTO } from "../dto/auth.dto";
import { type IUser } from "../types/user.interface"
import { type TimestampedDocument } from "../types/mongoose.types"
import userRepository = require("../repositories/user.repository");
import imageService = require("./image.service");
import bcrypt = require("bcryptjs");
import environment = require("../config/env");
import jwt = require("jsonwebtoken");
import AppError = require("../utils/appError");

class AuthService {
    //  async uploadProfileImage(profileImageFile: Express.Multer.File | undefined): Promise<string | null> {
    //     if (!profileImageFile) return null;

    //     return imageService.uploadImage(
    //         profileImageFile.buffer,
    //         profileImageFile.originalname,
    //         "profile_pictures"
    //     );
    // }

    // const profileImageUrl: string | null = await this.uploadProfileImage(profileImageFile);

    async register(registerData: RegisterDTO, profileImageFile: Express.Multer.File | undefined): Promise<TimestampedDocument<IUser>> {
        // Check if user already exist
        const existingUser: TimestampedDocument<IUser> | null = await userRepository.findByEmail(registerData.email);
        if (existingUser) throw new AppError(409, "Conflict: User with this email already exists.");

        // Upload profile picture if exist
        let profileImageUrl: string | null = null;
        if (profileImageFile) {
            profileImageUrl = await imageService.uploadImage(
                profileImageFile.buffer,
                profileImageFile.originalname,
                "profile_pictures"
            )
        }

        // Security: password hashing 
        const salt: string = await bcrypt.genSalt(10);
        const hashedPassword: string = await bcrypt.hash(registerData.password, salt);
        // const hashedPassword = bcrypt.hash(registerData.password, 10) // can also be written 

        // create user
        const registeredUser = await userRepository.create({
            ...registerData,
            role: "Customer", // Default value
            password: hashedPassword,
            profileImage: profileImageUrl
        })

        return registeredUser;
    }

    async login(loginData: LoginDTO): Promise<{ loggedInUser: TimestampedDocument<IUser>, accessToken: string }> {
        // Find user
        const foundUser: TimestampedDocument<IUser> | null = await userRepository.findByEmail(loginData.email);
        if (!foundUser) throw new AppError(404, "Resource: User does not exist.");

        // Check password
        const isPasswordMatch: boolean = await bcrypt.compare(loginData.password, foundUser.password);
        if (!isPasswordMatch) throw new AppError(400, "Bad Request: Invalid password!");

        // Access token generation
        const accessToken: string = jwt.sign({
            id: foundUser._id,
            role: foundUser.role,
            email: foundUser.email // match to DecodedUser interface
        }, environment.jwtSecret, { expiresIn: "1d" });

        return { loggedInUser: foundUser, accessToken }
    }

    async getMe(userId: string): Promise<TimestampedDocument<IUser>> {
        // Grab the fresh user data
        const currentUser: TimestampedDocument<IUser> | null = await userRepository.findById(userId);
        
        if (!currentUser) {
            throw new AppError(404, "Resource: User does not exist.");
        }

        return currentUser;
    }
}

export = new AuthService();