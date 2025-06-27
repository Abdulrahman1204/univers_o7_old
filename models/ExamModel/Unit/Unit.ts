import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import { IUnit } from "./dto";
import { Question } from "../Question/Question";

// Unit Schema
const UnitSchema: Schema<IUnit> = new Schema(
  {
    unitName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    available: {
      type: Boolean,
      default: false
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
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
UnitSchema.virtual("questions", {
  ref: "Question",
  foreignField: "unit",
  localField: "_id",
});

// Delete Lessons while Unit deleting
UnitSchema.pre("findOneAndDelete", async function (next) {
  const unitId = this.getQuery()._id;
  
  await Question.deleteMany({ unit: unitId });

  next();
});

// Unit Model
const Unit: Model<IUnit> = mongoose.model<IUnit>("Unit", UnitSchema);

// validation Schemas
const validateUnitCreate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    unitName: joi.string().trim().min(2).max(100).required(),
    available: joi.boolean(),
    subject: joi.string().required(),
  });

  return schema.validate(obj);
};

const validateUnitUpdate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    unitName: joi.string().trim().min(2).max(100),
    available: joi.boolean(),
    subject: joi.string(),
  });

  return schema.validate(obj);
};

export { Unit, validateUnitCreate, validateUnitUpdate };
