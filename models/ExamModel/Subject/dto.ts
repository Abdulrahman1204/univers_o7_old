import { Document, Types } from 'mongoose';

// Subject Interface
export interface ISubject extends Document {
    subjectName: string,
    class: Types.ObjectId
}