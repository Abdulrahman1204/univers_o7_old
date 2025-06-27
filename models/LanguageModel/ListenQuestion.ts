import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema, string } from "joi";
import { ILQuestion } from "./dto";

// Listen Question Schema
const LQuestionSchema: Schema<ILQuestion> = new Schema(
  {
    level: {
      type: Schema.Types.ObjectId,
      ref: "Level",
      required: true,
    },
    text: {
      type: String,
      required: true,
      minlength: 0,
    },
    type: {
      type: String,
      default: "listens"
    }
  },
  {
    timestamps: true,
  }
);

// Listen Question Model
const LQuestion: Model<ILQuestion> = mongoose.model<ILQuestion>(
  "Listen_Question",
  LQuestionSchema
);

// validation Schema
const validateLQuestionCreate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    level: joi.string().required(),
    text: joi.string().min(0).required(),
  });

  return schema.validate(obj);
};

const validateLQuestionUpdate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    level: joi.string(),
    text: joi.string().min(0),
  });

  return schema.validate(obj);
};

export { LQuestion, validateLQuestionCreate, validateLQuestionUpdate };
