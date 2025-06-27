import { Document, Types } from 'mongoose';

// Course Interface
export interface ICourse extends Document {
    courseName: string;
    teacher: Types.ObjectId;
    subject: Types.ObjectId;
    InstituteName: string;
    available: boolean;
    videos: object;
}