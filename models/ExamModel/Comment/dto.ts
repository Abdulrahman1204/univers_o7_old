import { Document, Types } from 'mongoose';

// Comment Interface
export interface IComment extends Document {
    student: Types.ObjectId;
    question: Types.ObjectId;
    comment: string;
}