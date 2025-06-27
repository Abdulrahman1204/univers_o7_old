import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import { ICourse } from "./dto";

// Course Schema
const CourseSchema: Schema<ICourse> = new Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    InstituteName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    available: {
      type: Boolean,
      default: false,
    },
    videos: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        isFree: { type: Boolean, default: false },
      },
    ],
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

// Course Model
const Course: Model<ICourse> = mongoose.model<ICourse>("Course", CourseSchema);

// validation Schemas
const validateCourseCreate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    courseName: joi.string().trim().min(2).max(100).required(),
    teacher: joi.string().trim().required(),
    subject: joi.string().trim().required(),
    InstituteName: joi.string().trim().min(2).max(100).required(),
    available: joi.boolean().default(false),
    videos: joi
      .array()
      .items(
        joi.object({
          title: joi.string().trim().min(2).max(200).required(),
          url: joi.string().uri().required(),
          isFree: joi.boolean().default(false),
        })
      )
      .min(1)
      .required(),
  });

  return schema.validate(obj);
};

const validateCourseUpdate = (obj: any): joi.ValidationResult => {
  const schema: joi.ObjectSchema = joi.object({
    courseName: joi.string().trim().min(2).max(100),
    teacher: joi.string(), 
    subject: joi.string(), 
    InstituteName: joi.string().trim().min(2).max(100),
    available: joi.boolean(),
    videos: joi.array().items(
      joi.object({
        title: joi.string().trim().min(2).max(200).required(),
        url: joi.string().uri().trim().required(),
        isFree: joi.boolean(),
      })
    ),
  }).min(1);

  return schema.validate(obj);
};

export { Course, validateCourseCreate, validateCourseUpdate };
