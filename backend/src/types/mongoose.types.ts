import { type HydratedDocument } from "mongoose"; // Mongoose also provide it's own 'WithTimestamps'

export interface Timestamps {
    createdAt: Date;
    updatedAt: Date;
}

export type WithTimestamps<T> = T & Timestamps;

export type TimestampedDocument<T> = HydratedDocument<WithTimestamps<T>>;