import mongoose, { Schema, Model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import { IAnswer, IQuestion } from "./dto";

// Question Schema
const QuestionSchema: Schema<IQuestion> = new Schema(
  {
    photo: {
      type: Object,
      default: {
        url: "null",
        publicId: null,
      },
    },
    unit: {
      type: Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["hard", "normal", "easy"],
      required: true,
    },
    questionType: {
      type: String,
      enum: ["single", "multiple"],
      required: true,
    },
    explanation: {
      type: {
        type: String,
        enum: ["text", "video", "image"],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
    },
    requests: [
      {
        requestText: {
          type: String,
          required: true,
        },
        answers: [
          {
            answerText: {
              type: String,
              required: true,
            },
            isCorrect: {
              type: Boolean,
              required: true,
            },
          },
        ],
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

// Comments
QuestionSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "question",
  localField: "_id",
});

// Question Model
const Question: Model<IQuestion> = mongoose.model<IQuestion>(
  "Question",
  QuestionSchema
);

// validation Schemas
const validateQuestionCreate = (obj: any): joi.ValidationResult => {
  const schema: ObjectSchema = joi.object({
    unit: joi.string().required(),
    teacher: joi.string().required(),
    questionText: joi.string().trim().required(),
    difficulty: joi.string().valid("hard", "normal", "easy").required(),
    questionType: joi.string().valid("single", "multiple").required(),
    explanation: joi
      .object({
        type: joi.string().valid("text", "video", "image").required(),
        content: joi.when("type", {
          is: "image",
          then: joi.string().allow("").required(), // Allow empty string for image explanation
          otherwise: joi.string().required(),
        }),
      })
      .required(),
    requests: joi
      .array()
      .items(
        joi.object({
          requestText: joi.string().trim().required(),
          answers: joi
            .array()
            .items(
              joi.object({
                answerText: joi.string().required(),
                isCorrect: joi.boolean().required(),
              })
            )
            .min(4)
            .max(4)
            .required(),
        })
      )
      .min(1),
  });

  return schema.validate(obj);
};

const validateQuestionUpdate = (obj: any): joi.ValidationResult => {
  const schema: joi.ObjectSchema = joi.object({
    unit: joi.string().trim(),
    teacher: joi.string().trim(),
    questionText: joi.string().trim().min(1).max(1000),
    difficulty: joi.string().valid("hard", "normal", "easy"),
    questionType: joi.string().valid("single", "multiple"),
    explanation: joi.object({
      type: joi.string().valid("text", "video", "image"),
      content: joi.string().when('type', {
        is: 'image',
        then: joi.string().uri(),
        otherwise: joi.string().min(1)
      })
    }).optional(),
    requests: joi.array().items(
      joi.object({
        requestText: joi.string().trim().min(1).max(500).required(),
        answers: joi.array().items(
          joi.object({
            answerText: joi.string().trim().min(1).max(300).required(),
            isCorrect: joi.boolean().required()
          })
        )
        .min(4).max(4)
        .custom((value, helpers) => {
          const correctAnswers = value.filter((answer: any) => answer.isCorrect);
          const questionType = helpers.state.ancestors[0]?.questionType;
          
          if (questionType === 'single' && correctAnswers.length !== 1) {
            return helpers.error('array.singleCorrect');
          }
          if (questionType === 'multiple' && correctAnswers.length < 1) {
            return helpers.error('array.atLeastOneCorrect');
          }
          return value;
        })
      })
    )
    .min(1),
    photo: joi.object({
      url: joi.string().uri(),
      publicId: joi.string()
    }).optional()
  })
  .min(1)
  .options({ abortEarly: false });

  return schema.validate(obj);
};

export { Question, validateQuestionCreate, validateQuestionUpdate };
