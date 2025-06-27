import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema, string } from "joi";
import { IRTQuestion } from "./dto";

// Read And Talk Question Schema
const RTQuestionSchema: Schema<IRTQuestion> = new Schema(
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
      default: "read_talk"
    }
  },
  {
    timestamps: true,
  }
);

// Read And Talk Question Model
const RTQuestion: Model<IRTQuestion> = mongoose.model<IRTQuestion>(
  "RTQuestion",
  RTQuestionSchema
);

// validation Schema
const validateRTQuestionCreate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    level: joi.string().required(),
    text: joi.string().min(0).required(),
  });

  return schema.validate(obj);
};

const validateRTQuestionUpdate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    text: joi.string().min(0),
  });

  return schema.validate(obj);
};

export { RTQuestion, validateRTQuestionCreate, validateRTQuestionUpdate };
