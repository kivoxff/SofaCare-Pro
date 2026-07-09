import type { RegisterDTO, LoginDTO } from "../dto/auth.dto";
import { type IUser } from "../types/user.interface"
import { type TimestampedDocument } from "../types/mongoose.types"
import userRepository = require("../repositories/user.repository");
import imageService = require("./image.service");
import bcrypt = require("bcryptjs");
import environment = require("../config/env");
import jwt = require("jsonwebtoken");
import AppError = require("../utils/AppError");

class AuthService {
    //  async uploadProfilePicture(profilePictureFile: Express.Multer.File | undefined): Promise<string | null> {
    //     if (!profilePictureFile) return null;

    //     return imageService.uploadImage(
    //         profilePictureFile.buffer,
    //         profilePictureFile.originalname,
    //         "profile_pictures"
    //     );
    // }

    // const profilePictureUrl: string | null = await this.uploadProfilePicture(profilePictureFile);

    async register(registerData: RegisterDTO, profilePictureFile: Express.Multer.File | undefined): Promise<TimestampedDocument<IUser>> {
        // Check if user already exist
        const existingUser: TimestampedDocument<IUser> | null = await userRepository.findByEmail(registerData.email);
        if (existingUser) throw new AppError(409, "Conflict: User with this email already exists.");

        // Upload profile picture if exist
        let profilePictureUrl: string | null = null;
        if (profilePictureFile) {
            profilePictureUrl = await imageService.uploadImage(
                profilePictureFile.buffer,
                profilePictureFile.originalname,
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
            profilePicture: profilePictureUrl
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

}

export = new AuthService();