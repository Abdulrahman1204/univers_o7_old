import {Document, Types} from 'mongoose'

// User Interface
export interface IUser extends Document {
  profilePhoto: object;
  userName: string;
  age: number;
  phoneNumber: string;
  password: string;www
  gender?: "male" | "female";
  role: "admin" | "superAdmin" | "sales";
}

// Teacher Interface
export interface ITeacher extends Document {
  userName: string;
  subject: Types.ObjectId;
  age: number;
  phoneNumber: string;
  password: string;
  gender?: "male" | "female";
  role: "teacher";
  questions: Types.ObjectId[];
}

// Student Interface
export interface IStudent extends Document {
  profilePhoto: object;
  userName: string;
  questions: Types.ObjectId[];
  exams: Types.ObjectId[],
  age: number;
  phoneNumber: string;
  password: string;
  gender?: "male" | "female";
  role: "student";
  purchasedUnits: Types.ObjectId[];
  purchasedCourses: Types.ObjectId[];
  purchasedLanguages: Types.ObjectId[];
}