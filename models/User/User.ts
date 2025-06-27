import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import bcrypt from "bcryptjs";
import { IUser } from "./dto";

// User Schema
const UserSchema: Schema<IUser> = new Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
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
      enum: ["admin", "superAdmin", "sales"],
      default: "sales",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});


// User Model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

// Validation Schemas
const validateRegisterUser = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    userName: joi.string().trim().min(2).max(100).required(),
    phoneNumber: joi.string().trim().length(10).required(),
    password: joi.string().trim().min(8).required(),
    gender: joi.string().valid("male", "female").required(),
    role: joi
      .string()
      .valid("student")
      .required(),
    age: joi.number().min(15).max(25).required(),
  });

  return schema.validate(obj);
};

const validateRegisterDash = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    userName: joi.string().trim().min(2).max(100).required(),
    phoneNumber: joi.string().trim().length(10).required(),
    password: joi.string().trim().min(8).required(),
    gender: joi.string().valid("male", "female").required(),
    role: joi
      .string()
      .valid("admin", "superAdmin", "sales")
      .required(),
    age: joi.number().min(15).max(25).required(),
  });

  return schema.validate(obj);
};

const validateLoginUser = (obj: any): joi.ValidationResult => {
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
    gender: joi.string().valid("male", "female"),
    age: joi.number().min(15).max(25),
  });

  return schema.validate(obj);
};

export { User, validateLoginUser, validateRegisterUser, validateRegisterDash, validateUpdateUserProfile };
