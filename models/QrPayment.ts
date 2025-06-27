import mongoose, { Document, Schema } from "mongoose";
import joi, { ObjectSchema } from "joi";

export interface IQrPayment extends Document {
  type: string;
  entityId: mongoose.Types.ObjectId;
  uniqueCode: string;
  used: boolean;
}

const QrPaymentSchema: Schema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["course", "unit"],
    },
    entityId: { 
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "type",
    },
    uniqueCode: {
      type: String,
      required: true,
      unique: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const QrPayment = mongoose.model<IQrPayment>("QrPayment", QrPaymentSchema);

// validation Schemas
const validateQrCreate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    type: joi.string().valid("course", "unit").required(),
    unitId: joi.string().trim().required(),
    uniqueCode: joi.string().trim().required(),
  });

  return schema.validate(obj);
};

export { QrPayment, QrPaymentSchema };
