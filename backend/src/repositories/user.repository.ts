import userModel = require("../models/user.model");
import type { IUser } from "../types/user.interface"
import type { TimestampedDocument } from "../types/mongoose.types"
import AppError = require("../utils/appError");

class UserRepository {
    async create(userData: IUser): Promise<TimestampedDocument<IUser>> {
        const createdUser: TimestampedDocument<IUser> = await userModel.create(userData);
        return createdUser;
    }

    async findByEmail(email: string): Promise<TimestampedDocument<IUser> | null> {
        const foundUser: TimestampedDocument<IUser> | null = await userModel.findOne({ email });
        return foundUser;
    }

    async findById(id: string): Promise<TimestampedDocument<IUser> | null> {
        const foundUser: TimestampedDocument<IUser> | null = await userModel.findById(id);
        return foundUser;
    }

    async updateById(id: string, updateData: Partial<IUser>): Promise<TimestampedDocument<IUser>> {
        // .orFail() tells Mongoose to throw a DocumentNotFoundError if the ID doesn't exist,
        // which removes 'null' from the possible return types.
        const updatedUser: TimestampedDocument<IUser> | null = await userModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true } // Returns the updated doc and runs schema validations
        )

        if (!updatedUser) throw new Error(`Repository error: Failed to update user (id: ${id}).`);

        return updatedUser;
    }

    async findByFilters(filters: Record<string, string>): Promise<TimestampedDocument<IUser>[]> {
        const foundUsers = await userModel
            .find(filters)
            .sort({ createdAt: -1 }); // Newest users first

        return foundUsers;
    }

    // FUTURE

    // async findByFilters(filters: Record<string, string | { $in: string[] }>): Promise<TimestampedDocument<IUser>[]> {
    //     const foundUsers = await userModel
    //         .find(filters)
    //         .sort({ createdAt: -1 });

    //     return foundUsers;
    // }
}

export = new UserRepository();