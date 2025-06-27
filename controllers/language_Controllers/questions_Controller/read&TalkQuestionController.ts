import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  RTQuestion,
  validateRTQuestionCreate,
  validateRTQuestionUpdate,
} from "../../../models/LanguageModel/R&TQuestion";
import { Level } from "../../../models/LanguageModel/Level";

class RTController {
  /**-----------------------------------------------
   * @desc    Create New Read & Talk Question
   * @route   /api/language/rtQuestion
   * @method  POST
   * @access  private(only SuperAdmin) 
   ------------------------------------------------*/
  createNewQuestion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateRTQuestionCreate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const level = await Level.findById(req.body.level);
        if (!level) {
          res.status(400).json({ message: "level not found" });
          return;
        }

        await RTQuestion.create({
          level: req.body.level,
          text: req.body.text,
        });

        res.status(201).json({
          message: "Created Successfully",
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
   * @desc    Get All Read & Talk Questions
   * @route   /api/language/rtQuestion
   * @method  GET
   * @access  private(only SuperAdmin) 
   ------------------------------------------------*/
  getRTQuestions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        let questions;
        const { page, perPage, levelId } = req.query;

        const filter: any = {};

        if (levelId) {
          filter.level = levelId;
        }

        if (page && perPage) {
          questions = await RTQuestion.find(filter)
            .skip((Number(page) - 1) * Number(perPage))
            .limit(Number(perPage))
            .sort({ createdAt: -1 });
        } else {
          questions = await RTQuestion.find(filter).sort({ createdAt: -1 });
        }

        if (!questions) {
          res.status(400).json({ message: "No Read & Talk Questions" });
          return;
        }

        const documentCount = await RTQuestion.countDocuments(filter);

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
   * @desc    Update Read & Talk Question
   * @route   /api/language/rtQuestion/:id
   * @method  PUT
   * @access  private(only SuperAdmin) 
   ------------------------------------------------*/
  updateRTQuestion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateRTQuestionUpdate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const question = await RTQuestion.findById(req.params.id);
        if (!question) {
          res.status(400).json({ message: "Question not found" });
          return;
        }

        await RTQuestion.findByIdAndUpdate(req.params.id, {
          $set: {
            level: req.body.level,
            text: req.body.text,
          },
        });

        res.status(200).json({
          message: "Updated Successfully",
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
   * @desc    Delete Read & Talk Question
   * @route   /api/language/rtQuestion/:id
   * @method  DELETE
   * @access  private(only SuperAdmin) 
   ------------------------------------------------*/
  deleteRTQuestion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const question = await RTQuestion.findById(req.params.id);
        if (!question) {
          res.status(400).json({ message: "Question not found" });
          return;
        }

        await RTQuestion.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Deleted Successfully" });
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

export default new RTController();