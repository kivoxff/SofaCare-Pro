import { type Role } from "../types/user.interface";
import userRepository = require("../repositories/user.repository");
import { type TimestampedDocument } from "../types/mongoose.types";
import { type IUser } from "../types/user.interface";
import AppError = require("../utils/appError");

class UserService {
    async updateRole(targetUserId: string, newRole: Role, updaterRole: Role): Promise<TimestampedDocument<IUser>> {
        // Check if user exists or not  
        const targetUser: TimestampedDocument<IUser> | null = await userRepository.findById(targetUserId);
        if (!targetUser) throw new AppError(404, "Resource: User does not exist.");

        // Enforce Role Permissions
        if (updaterRole === "Manager") {
            // Managers can assign only Customer or Field_Cleaner roles
            if (newRole !== "Customer" && newRole !== "Field_Cleaner") {
                throw new AppError(403, "Unauthorized: You can only assign 'Customer' or 'Field Cleaner' roles.");
            }

            // Managers cannot change Owners or other Managers
            if (targetUser.role === "Owner" || targetUser.role === "Manager") {
                throw new AppError(403, "Unauthorized: You are not allowed to modify this user's role.");
            }
        } else if (updaterRole === "Owner") {
            // FUTURE
            // Owners can assign any role.
        } else {
            // Fallback for safety (though middleware should catch this first)
            throw new AppError(401, "Unauthorized: You are not permitted to update user roles.");
        }

        const updatedUser: TimestampedDocument<IUser> = await userRepository.updateById(targetUserId, { role: newRole });

        return updatedUser;
    }

    async getUsersByRole(requestedRole: string, requesterRole: Role): Promise<TimestampedDocument<IUser>[]> {
        const queryFilter: Record<string, string> = {};

        // Enforce permissions based on the requester's role
        if (requesterRole === "Manager") {
            // Managers are ONLY allowed to request "Customer" or "Field_Cleaner"
            if (requestedRole !== "Customer" && requestedRole !== "Field_Cleaner") {
                throw new AppError(403, "Unauthorized: You can only request users with role 'Customer' or 'Field_Cleaner'.");
            }
            queryFilter.role = requestedRole;

        } else if (requesterRole === "Owner") {
            // Owners can request "All", or any specific role
            if (requestedRole !== "All") {
                queryFilter.role = requestedRole;
            }

        } else {
            // Fallback for safety
            throw new AppError(403, "Unauthorized: You do not have permission to request users by role.");
        }

        const foundUsers: TimestampedDocument<IUser>[] = await userRepository.findByFilters(queryFilter);
        return foundUsers;
    }

    // FUTURE

    // async getUsersByRole(requestedRole: string, requesterRole: Role): Promise<TimestampedDocument<IUser>[]> {
    //     const queryFilter: Record<string, string | { $in: string[] }> = {};

    //     if (requesterRole === "Manager") {
    //         // Managers can only see Customers and Field Cleaners
    //         if (requestedRole === "All") {
    //             queryFilter.role = { $in: ["Customer", "Field_Cleaner"] };
    //         } else if (requestedRole === "Customer" || requestedRole === "Field_Cleaner") {
    //             queryFilter.role = requestedRole;
    //         } else {
    //             throw new AppError(403, "Unauthorized: You can only get users with role Customer and Field Cleaner.");
    //         }
    //     } else if (requesterRole === "Owner") {
    //         // Owners can view anyone
    //         if (requestedRole !== "All") {
    //             queryFilter.role = requestedRole;
    //         }
    //     } else {
    //          throw new AppError(403, "Unauthorized: You do not have permission to request users by role.");
    //     }

    //     const foundUsers: TimestampedDocument<IUser>[] = await userRepository.findByFilters(queryFilter);
    //     return foundUsers;
    // }
}

export = new UserService();