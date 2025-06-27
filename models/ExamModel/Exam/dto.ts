import { Document, Types } from 'mongoose';

// Exam Interface
export interface IExam extends Document {
    units: Types.ObjectId[];
    teacher: Types.ObjectId;
    difficulty: 'hard' | 'normal' | 'easy';
    numberOfQuestions: number;
    questions: Types.ObjectId;
    createdBy: Types.ObjectId;
}