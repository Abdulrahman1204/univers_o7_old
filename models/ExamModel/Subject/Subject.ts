import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import { ISubject } from "./dto";
import { Unit } from "../Unit/Unit";
import { Teacher } from "../../User/Teacher";

// Subject Schema
const SubjectSchema: Schema<ISubject> = new Schema(
  {
    subjectName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
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
SubjectSchema.virtual("units", {
  ref: "Unit",
  foreignField: "subject",
  localField: "_id",
});

// Teacher
SubjectSchema.virtual("teacher", {
  ref: "Teacher",
  foreignField: "subjects",
  localField: "_id",
});

// Delete Units while Subject deleting
SubjectSchema.pre("findOneAndDelete", async function (next) {
  const subjectId = this.getQuery()._id;

  const units = await Unit.find({ subject: subjectId });

  for (const unit of units) {
    await Unit.findByIdAndDelete(unit._id);
  }

  await Teacher.updateMany(
    { subjects: subjectId },
    { $pull: { subjects: subjectId } }
  );

  next();
});

// Subject Model
const Subject: Model<ISubject> = mongoose.model<ISubject>(
  "Subject",
  SubjectSchema
);

// validation Schemas
const validateSubjectCreate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    subjectName: joi.string().trim().min(2).max(100).required(),
    class: joi.string().required(),
  });

  return schema.validate(obj);
};

const validateSubjectUpdate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    subjectName: joi.string().trim().min(2).max(100),
    class: joi.string(),
  });

  return schema.validate(obj);
};

export { Subject, validateSubjectCreate, validateSubjectUpdate };
