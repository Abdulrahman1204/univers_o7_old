import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import { IComment } from "./dto";

// Comment Schema
const CommentSchema: Schema<IComment> = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
  }
);

// Comment Model
const Comment: Model<IComment> = mongoose.model<IComment>(
  "Comment",
  CommentSchema
);

// validation Schema
const validateCommentCreate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    student: joi.string(),
    question: joi.string().required(),
    comment: joi.string().trim().required(),
  });

  return schema.validate(obj);
};

const validateCommentUpdate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    comment: joi.string().trim(),
  });

  return schema.validate(obj);
};

export {Comment, validateCommentCreate, validateCommentUpdate}