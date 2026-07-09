import mongoose = require("mongoose");
import { type Schema } from "mongoose";
import type { IUser } from "../types/user.interface"
import type { WithTimestamps } from "../types/mongoose.types"

// TypeScript checks the types of the fields you define, but it does not require you to define every property from <WithTimestamps<IUser>>.
const UserSchema: Schema = new mongoose.Schema<WithTimestamps<IUser>>({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    role: {
        type: String,
        default: "Customer",
        enum: ["Customer", "Field_Cleaner", "Manager", "Owner"]
    },
}, { timestamps: true }) // This implicitly adds createdAt and updatedAt to the DB document

// The model takes <WithTimestamps<IUser>> so anytime you do User.findOne(), it knows exactly what is returned
export = mongoose.model<WithTimestamps<IUser>>("User", UserSchema);


// NOTE

// mongoose.Schema.Types.ObjectId: This is only used when building schemas to tell Mongoose what type a database column will hold.
// mongoose.Types.ObjectId: This is the actual value object (inherited from MongoDB's native BSON library) that holds the data.