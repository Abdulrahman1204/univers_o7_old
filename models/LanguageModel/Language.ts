import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import { ILanguage } from "./dto";

// Language Schema
const LanguageSchema: Schema<ILanguage> = new Schema(
  {
    languageName: {
      type: String,
      required: true,
      minLength: 0,
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

// Levels
LanguageSchema.virtual("levels", {
  ref: "Level",
  foreignField: "language",
  localField: "_id",
});

// Language Model
const Language: Model<ILanguage> = mongoose.model<ILanguage>(
  "Language",
  LanguageSchema
);

// validation Schema
const validateLanguageCreate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    languageName: joi.string().min(0).required(),
  });

  return schema.validate(obj);
};

const validateLanguageUpdate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    languageName: joi.string().min(0),
  });

  return schema.validate(obj);
};

export { Language, validateLanguageCreate, validateLanguageUpdate };
