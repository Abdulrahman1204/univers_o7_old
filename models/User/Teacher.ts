import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ITeacher } from "./dto";

//Teacher Schema
const TeacherSchema: Schema<ITeacher> = new Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
    },
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
      enum: ["teacher"],
      default: "teacher",
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

// Units
TeacherSchema.virtual("units", {
  ref: "Unit",
  foreignField: "teacher",
  localField: "_id",
});

// questions
TeacherSchema.virtual("questions", {
  ref: "Question",
  foreignField: "teacher",
  localField: "_id",
});

TeacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});


// Teacher Model
const Teacher: Model<ITeacher> = mongoose.model<ITeacher>(
  "Teacher",
  TeacherSchema
);

// Validation Schemas
const validateRegisterTeacher = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    userName: joi.string().trim().min(2).max(100).required(),
    phoneNumber: joi.string().trim().length(10).required(),
    subject: joi.string().required(),
    password: joi.string().trim().min(8).required(),
    gender: joi.string().valid("male", "female").required(),
    role: joi.string().valid("teacher").required(),
    age: joi.number().min(15).max(25).required(),
  });

  return schema.validate(obj);
};

const validateLoginTeacher = (obj: any): joi.ValidationResult => {
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
    subject: joi.string(),
    gender: joi.string().valid("male", "female"),
    age: joi.number().min(15).max(25),
  });

  return schema.validate(obj);
};

export {
  Teacher,
  validateLoginTeacher,
  validateRegisterTeacher,
  validateUpdateUserProfile,
};
