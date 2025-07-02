import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import bcrypt from "bcryptjs";
import { IStudent } from "./dto";

// Student Schema
const StudentSchema: Schema<IStudent> = new Schema(
  {
    profilePhoto: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        publicId: null,
      },
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    exams: [
      {
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
        },
        mark: {
          type: Number,
          min: 0,
          max: 100,
        },
        numberOfQuestions: {
          type: Number,
          required: true,
        },
        units: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Unit",
          },
        ],
      },
    ],
    age: { type: Number, required: true, min: 15, max: 25 },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      minlength: 10,
      maxlength: 10,
    },
    password: { type: String, required: true, trim: true, minLength: 8 },
    gender: { type: String, required: true, enum: ["male", "female"] },
    role: {
      type: String,
      enum: ["student"],
      default: "student",
    },
    purchasedCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    purchasedUnits: [
      {
        type: Schema.Types.ObjectId,
        ref: "Unit",
      },
    ],
    purchasedLanguages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Level",
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

StudentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Student Model
const Student: Model<IStudent> = mongoose.model<IStudent>(
  "Student",
  StudentSchema
);

// Validation Schemas
const validateRegisterStudent = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    userName: joi.string().trim().min(2).max(100).required(),
    phoneNumber: joi.string().trim().length(10).required(),
    questions: joi.array().items(joi.string()).min(1),
    password: joi.string().trim().min(8).required(),
    gender: joi.string().valid("male", "female").required(),
    role: joi.string().valid("student").required(),
    age: joi.number().min(15).max(25).required(),
  });

  return schema.validate(obj);
};

const validateLoginStudent = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    phoneNumber: joi.string().trim().required(),
    password: joi.string().trim().min(8).required(),
  });

  return schema.validate(obj);
};

const validateUpdateUserProfile = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    userName: joi.string().trim().min(2).max(100),
    phoneNumber: joi.string().trim().length(10),
    questions: joi.array().items(joi.string()).min(1),
    gender: joi.string().valid("male", "female"),
    age: joi.number().min(15).max(25),
  });

  return schema.validate(obj);
};

const validateFavouriteQ = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    questions: joi.string().required().trim(),
  });

  return schema.validate(obj);
};

const validateAddExams = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    exams: joi.array().items(
      joi.object({
        subjectId: joi.string().required(),
        mark: joi.number().min(0).max(100).required(),
        numberOfQuestions: joi.number().required(),
        units: joi.array().items(joi.string()).required(),
      })
    ),
  });

  return schema.validate(obj);
};

export {
  Student,
  validateLoginStudent,
  validateRegisterStudent,
  validateUpdateUserProfile,
  validateFavouriteQ,
  validateAddExams,
};
