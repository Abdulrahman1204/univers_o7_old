import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import { IClass } from "./dto";
import { Subject } from "../Subject/Subject";

// Class Schema
const ClassSchema: Schema<IClass> = new Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
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

// Subjects
ClassSchema.virtual("subjects", {
  ref: "Subject",
  foreignField: "class",
  localField: "_id",
});

// Delete Subject while class deleting
ClassSchema.pre("findOneAndDelete", async function (next) {
  const classId = this.getQuery()._id;

  const subjects = await Subject.find({ class: classId });

  for (const subject of subjects) {
    await Subject.findByIdAndDelete(subject._id);
  }
});

// Class Model
const Class: Model<IClass> = mongoose.model<IClass>("Class", ClassSchema);

// validation Schemas
const validateClassCreate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    className: joi.string().trim().min(2).max(100).required(),
  });

  return schema.validate(obj);
};

const validateClassUpdate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    className: joi.string().trim().min(2).max(100),
  });

  return schema.validate(obj);
};

export { Class, validateClassCreate, validateClassUpdate };
