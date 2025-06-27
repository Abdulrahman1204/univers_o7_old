import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema, string } from "joi";
import { RankingQuesiton } from "./dto";

// Ranking Question Schema
const RQuestionSchema: Schema<RankingQuesiton> = new Schema(
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
      default: "rank"
    }
  },
  {
    timestamps: true,
  }
);

// Ranking Question Model
const RQuestion: Model<RankingQuesiton> = mongoose.model<RankingQuesiton>(
  "RinkingQuestion",
  RQuestionSchema
);

// validation Schema
const validateRQuestionCreate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    level: joi.string().required(),
    text: joi.string().min(0).required(),
  });

  return schema.validate(obj);
};

const validateRQuestionUpdate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    text: joi.string().min(0),
  });

  return schema.validate(obj);
};

export { RQuestion, validateRQuestionCreate, validateRQuestionUpdate };
