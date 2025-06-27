import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import {
  Question,
  validateQuestionCreate,
  validateQuestionUpdate,
} from "../../../models/ExamModel/Question/Question";
import { Unit } from "../../../models/ExamModel/Unit/Unit";
import { Teacher } from "../../../models/User/Teacher";

interface MulterFiles {
  photo?: Express.Multer.File[];
  imageQ?: Express.Multer.File[];
}

class QuestionController {
  /**-----------------------------------------------
 * @desc    Create New Question
 * @route   /api/exam/question
 * @method  POST
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/

  createQuestionCtrl = asyncHandler(async (req: Request, res: Response) => {
    try {
      if (typeof req.body.requests === "string") {
        req.body.requests = JSON.parse(req.body.requests);
      }

      if (typeof req.body.explanation === "string") {
        req.body.explanation = JSON.parse(req.body.explanation);
      }

      const { error } = validateQuestionCreate(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return; // Ensure execution stops, but don't return the response object
      }

      const unit = await Unit.findById(req.body.unit);
      if (!unit) {
        res.status(404).json({ message: "Unit not found" });
        return;
      }

      const teacher = await Teacher.findById(req.body.teacher);
      if (!teacher) {
        res.status(404).json({ message: "Teacher not found" });
        return;
      }

      const existingQuestion = await Question.findOne({
        questionText: req.body.questionText,
      });
      if (existingQuestion) {
        res.status(400).json({ message: "Question already exists" });
        return;
      }

      const files = req.files as {
        photo?: Express.Multer.File[];
        imageQ?: Express.Multer.File[];
      };

      const photoFile = files?.photo?.[0] || null;
      const explanationImageFile = files?.imageQ?.[0] || null;

      const photo = photoFile
        ? { url: photoFile.path, publicId: photoFile.filename }
        : { url: "null", publicId: "null" };

      let explanationContent = req.body.explanation.content;
      if (req.body.explanation.type === "image") {
        if (explanationImageFile) {
          explanationContent = explanationImageFile.path;
        } else {
          res.status(400).json({
            message:
              "Explanation image is required when explanation type is 'image'.",
          });
          return;
        }
      }

      const question = await Question.create({
        photo,
        unit: req.body.unit,
        teacher: req.body.teacher,
        questionText: req.body.questionText,
        difficulty: req.body.difficulty,
        questionType: req.body.questionType,
        explanation: {
          type: req.body.explanation.type,
          content: explanationContent,
        },
        requests: req.body.requests,
      });

      res.status(201).json({
        message: "Question created successfully",
        question,
      });
    } catch (err) {
      console.error("Server Error:", err);
      res.status(500).json({
        message: "Server error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  });
  /**-----------------------------------------------
 * @desc    Get All Class
 * @route   /api/exam/class
 * @method  GET
 * @access  public 
 ------------------------------------------------*/
  getQuestionsCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        let questions;
        const { page, perPage, questionText, unitId, teacherId, questionType } =
          req.query;

        const filter: any = {};

        if (questionText) {
          filter.questionText = {
            $regex: new RegExp(String(questionText), "i"),
          };
        }
        if (teacherId) {
          filter.teacher = teacherId;
        }
        if (unitId) {
          filter.unit = unitId;
        }
        if (questionType) {
          filter.questionType = questionType;
        }
        if (page && perPage) {
          questions = await Question.find(filter)
            .skip((Number(page) - 1) * Number(perPage))
            .limit(Number(perPage))
            .sort({ createdAt: -1 })
            .populate("unit")
            .populate("comments");
        } else {
          questions = await Question.find(filter)
            .sort({ createdAt: -1 })
            .populate("unit")
            .populate("comments");
        }

        if (!questions) {
          res.status(400).json({ message: "No Questions Found" });
          return;
        }

        const documentCount = await Question.countDocuments(filter);

        res
          .status(200)
          .json({ questions, totalCount: questions.length, documentCount });
      } catch (err: unknown) {
        if (err instanceof Error) {
          res.status(500).json({
            message: "Server error",
            path: req.originalUrl,
            error: err.message,
          });
        } else {
          res.status(500).json({ message: "Unknown server error" });
        }
      }
    }
  );

  /**-----------------------------------------------
 * @desc    Update Question
 * @route   /api/exam/question/:id
 * @method  Put
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  updateQuestionCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        // Parse stringified JSON fields if they exist
        if (typeof req.body.requests === "string") {
          req.body.requests = JSON.parse(req.body.requests);
        }
        if (typeof req.body.explanation === "string") {
          req.body.explanation = JSON.parse(req.body.explanation);
        }

        const { error } = validateQuestionUpdate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const { id } = req.params;
        const question = await Question.findById(id);
        if (!question) {
          res.status(404).json({ message: "Question not found" });
          return;
        }

        // Check if unit exists if being updated
        if (req.body.unit && req.body.unit !== question.unit.toString()) {
          const unitExists = await Unit.findById(req.body.unit);
          if (!unitExists) {
            res.status(404).json({ message: "Unit not found" });
            return;
          }
        }

        // Check if teacher exists if being updated
        if (
          req.body.teacher &&
          req.body.teacher !== question.teacher.toString()
        ) {
          const teacherExists = await Teacher.findById(req.body.teacher);
          if (!teacherExists) {
            res.status(404).json({ message: "Teacher not found" });
            return;
          }
        }

        // Check for duplicate question text if being updated
        if (
          req.body.questionText &&
          req.body.questionText !== question.questionText
        ) {
          const existingQuestion = await Question.findOne({
            questionText: req.body.questionText,
            _id: { $ne: id },
          });
          if (existingQuestion) {
            res
              .status(400)
              .json({ message: "Question with this text already exists" });
            return;
          }
        }

        // Handle file uploads
        const files = req.files as {
          photo?: Express.Multer.File[];
          imageQ?: Express.Multer.File[];
        };

        const photoFile = files?.photo?.[0];
        const explanationImageFile = files?.imageQ?.[0];

        // Prepare update data
        const updateData: any = {
          unit: req.body.unit || question.unit,
          teacher: req.body.teacher || question.teacher,
          questionText: req.body.questionText || question.questionText,
          difficulty: req.body.difficulty || question.difficulty,
          questionType: req.body.questionType || question.questionType,
          requests: req.body.requests || question.requests,
        };

        // Handle photo update
        if (photoFile) {
          updateData.photo = {
            url: photoFile.path,
            publicId: photoFile.filename,
          };
        }

        // Handle explanation update
        if (req.body.explanation) {
          let explanationContent =
            req.body.explanation.content || question.explanation.content;

          if (req.body.explanation.type === "image") {
            if (explanationImageFile) {
              explanationContent = explanationImageFile.path;
            } else if (
              !question.explanation.content ||
              question.explanation.type !== "image"
            ) {
              res.status(400).json({
                message:
                  "Explanation image is required when changing to image type",
              });
              return;
            }
          }

          updateData.explanation = {
            type: req.body.explanation.type || question.explanation.type,
            content: explanationContent,
          };
        }

        // Perform the update
        const updatedQuestion = await Question.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        );

        res.status(200).json({
          message: "Question updated successfully",
          question: updatedQuestion,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          res.status(500).json({
            message: "Server error",
            path: req.originalUrl,
            error: err.message,
          });
        } else {
          res.status(500).json({ message: "Unknown server error" });
        }
      }
    }
  );

  /**-----------------------------------------------
 * @desc    Delete Question
 * @route   /api/exam/question/:id
 * @method  DELETE
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  deleteQuestionCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const question = await Question.findById(req.params.id);
        if (!question) {
          res.status(400).json({ message: "No Question" });
          return;
        }

        await Question.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Deleted Successfuly" });
      } catch (err: unknown) {
        if (err instanceof Error) {
          res.status(500).json({
            message: "Server error",
            path: req.originalUrl,
            error: err.message,
          });
        } else {
          res.status(500).json({ message: "Unknown server error" });
        }
      }
    }
  );
}

export default new QuestionController();
