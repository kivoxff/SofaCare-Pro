import {type Role} from "../types/user.interface";
import userRepository = require("../repositories/user.repository");
import {type TimestampedDocument} from "../types/mongoose.types";
import {type IUser} from "../types/user.interface";
import AppError = require("../utils/AppError");

class UserService {
    async updateRole(targetUserId: string, newRole: Role, updaterRole: Role): Promise<TimestampedDocument<IUser>> {
        // Check if user exists or not  
        const targetUser: TimestampedDocument<IUser> | null = await userRepository.findById(targetUserId);
        if(!targetUser) throw new AppError(404, "Resource: User does not exist.");

        // Enforce Role Permissions
        if(updaterRole === "Manager") {
            // Managers can assign only Customer or Field_Cleaner roles
            if(newRole !== "Customer" && newRole !== "Field_Cleaner") {
                throw new AppError(403, "Unauthorized: You can only assign 'Customer' or 'Field Cleaner' roles.");
            }

            // Managers cannot change Owners or other Managers
            if(targetUser.role ==="Owner" || targetUser.role === "Manager") {
                throw new AppError(403, "Unauthorized: You are not allowed to modify this user's role.");
            }
        } else if (updaterRole === "Owner") {
            // FUTURE
            // Owners can assign any role.
        } else {
            // Fallback for safety (though middleware should catch this first)
            throw new AppError(401, "Unauthorized: You are not permitted to update user roles.");
        }

        const updatedUser: TimestampedDocument<IUser> = await userRepository.updateById(targetUserId, {role: newRole});

        return updatedUser;
    }

    async getUsersByRole(requestedRole: string): Promise<TimestampedDocument<IUser>[]> {
        const queryFilter: Record<string, string> = {};

        if (requestedRole !== "All") {
            queryFilter.role = requestedRole;
        }

        const foundUsers: TimestampedDocument<IUser>[] = await userRepository.findByFilters(queryFilter);
        return foundUsers;
    }
}

export = new UserService();