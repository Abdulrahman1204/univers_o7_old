import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import { ILevel } from "./dto";

// Level Schema
const LevelSchema: Schema<ILevel> = new Schema(
  {
    language: {
      type: Schema.Types.ObjectId,
      ref: "Language",
      required: true,
    },
    levelNumber: {
      type: Number,
      required: true,
      min: 0,
    },
    available: {
      type: Boolean,
      default: false,
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

// Listen Question
LevelSchema.virtual("listens", {
  ref: "Listen_Question",
  foreignField: "level",
  localField: "_id",
});

LevelSchema.virtual("emptes", {
  ref: "Empty_Question",
  foreignField: "level",
  localField: "_id",
});

LevelSchema.virtual("means", {
  ref: "Mean_Question",
  foreignField: "level",
  localField: "_id",
});

LevelSchema.virtual("read_talk", {
  ref: "RTQuestion",
  foreignField: "level",
  localField: "_id",
});

LevelSchema.virtual("rank", {
  ref: "RinkingQuestion",
  foreignField: "level",
  localField: "_id",
});

// Level Model
const Level: Model<ILevel> = mongoose.model<ILevel>("Level", LevelSchema);

// validation Schema
const validateLevelCreate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    language: joi.string().required(),
    levelNumber: joi.number().min(0).required(),
    available: joi.boolean().required(),
  });

  return schema.validate(obj);
};

const validateLevelUpdate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    language: joi.string(),
    levelNumber: joi.number().min(0),
    available: joi.boolean(),
  });

  return schema.validate(obj);
};

export { Level, validateLevelCreate, validateLevelUpdate };
