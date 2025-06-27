import { Document, Types } from "mongoose";

// Unit Interface
export interface IUnit extends Document {
    unitName: string,
    available: boolean,
    subject: Types.ObjectId
}