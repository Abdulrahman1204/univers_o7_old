import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import { IExam } from "./dto";

// Exam Schema
const ExamSchema: Schema<IExam> = new Schema(
  {
    units: [
      {
        type: Schema.Types.ObjectId,
        ref: "Unit",
        required: true,
      }
    ],
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["hard", "normal", "easy"],
      required: true,
    },  
    numberOfQuestions: {
      type: Number,
      required: true,
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Exam Model
const Exam: Model<IExam> = mongoose.model<IExam>("Exam", ExamSchema);

// validation Schemas
const validateExamCreate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    units: joi.array().items(joi.string()).required(),
    teacher: joi.string().required(),
    difficulty: joi.string().required(),
    numberOfQuestions: joi.number().required(),
    questions: joi.array().items(joi.string()).min(1),
    createdBy: joi.string(), 
  });

  return schema.validate(obj);
};

const validateExamUpdate = (obj: any): joi.ValidationResult => {
    const schema: ObjectSchema = joi.object({
      units: joi.string(),
      teacher: joi.string(),
      difficulty: joi.string(),
      numberOfQuestions: joi.number(),
      questions: joi.array().items(joi.string()).min(1),
      createdBy: joi.string(), 
    });
  
    return schema.validate(obj);
  };
  
  export { Exam, validateExamCreate, validateExamUpdate}