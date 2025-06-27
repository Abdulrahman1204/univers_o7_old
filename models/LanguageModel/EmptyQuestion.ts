import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema, string } from "joi";
import { IEQuestion } from "./dto";

// Empty Question Schema
const EQuestionSchema: Schema<IEQuestion> = new Schema(
  {
    level: {
      type: Schema.Types.ObjectId,
      ref: "Level",
      required: true,
    },
    text: {
      type: String,
      required: true,
      minlength: 10,
    },
    type: {
      type: String,
      default: "emptes",
    },
    word: {
      type: String,
      required: true,
    },
    correct: {
      type: String,
      required: true,
      minlength: 0,
      maxlength: 100,
    },
    firstAnswer: {
      type: String,
      required: true,
      minlength: 0,
      maxlength: 100,
    },
    secondAnswer: {
      type: String,
      required: true,
      minlength: 0,
      maxlength: 100,
    },
    thirdAnswer: {
      type: String,
      required: true,
      minlength: 0,
      maxlength: 100,
    },
    forthAnswer: {
      type: String,
      required: true,
      minlength: 0,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Empty Question Model
const EQuestion: Model<IEQuestion> = mongoose.model<IEQuestion>(
  "Empty_Question",
  EQuestionSchema
);

// validation Schema
const validateEQuestionCreate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    level: joi.string().required(),
    text: joi.string().min(0).required(),
    correct: joi.string().min(0).max(100).required(),
    word: joi.string().required(),
    firstAnswer: joi.string().min(0).max(100).required(),
    secondAnswer: joi.string().min(0).max(100).required(),
    thirdAnswer: joi.string().min(0).max(100).required(),
    forthAnswer: joi.string().min(0).max(100).required(),
  });

  return schema.validate(obj);
};

const validateEQuestionUpdate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    text: joi.string().min(0),
    correct: joi.string().min(0).max(100),
    firstAnswer: joi.string().min(0).max(100),
    word: joi.string(),
    secondAnswer: joi.string().min(0).max(100),
    thirdAnswer: joi.string().min(0).max(100),
    forthAnswer: joi.string().min(0).max(100),
  });

  return schema.validate(obj);
};

export { EQuestion, validateEQuestionCreate, validateEQuestionUpdate };
