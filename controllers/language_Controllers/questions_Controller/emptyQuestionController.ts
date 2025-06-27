import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  EQuestion,
  validateEQuestionCreate,
  validateEQuestionUpdate,
} from "../../../models/LanguageModel/EmptyQuestion";
import { Level } from "../../../models/LanguageModel/Level";

class EmptyController {
  /**-----------------------------------------------
   * @desc    Create New Empty Question
   * @route   /api/language/emptyQuestion
   * @method  POST
   * @access  private(only SuperAdmin) 
   ------------------------------------------------*/
  createNewQuestion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateEQuestionCreate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const level = await Level.findById(req.body.level);
        if (!level) {
          res.status(400).json({ message: "level not found" });
          return;
        }

        await EQuestion.create({
          level: req.body.level,
          text: req.body.text,
          correct: req.body.correct,
          word: req.body.word,
          firstAnswer: req.body.firstAnswer,
          secondAnswer: req.body.secondAnswer,
          thirdAnswer: req.body.thirdAnswer,
          forthAnswer: req.body.forthAnswer,
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
   * @desc    Get All Empty Questions
   * @route   /api/language/emptyQuestion
   * @method  GET
   * @access  private(only SuperAdmin) 
   ------------------------------------------------*/
  getEmptyQuestions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        let questions;
        const { page, perPage, levelId } = req.query;

        const filter: any = {};

        if (levelId) {
          filter.level = levelId;
        }

        if (page && perPage) {
          questions = await EQuestion.find(filter)
            .skip((Number(page) - 1) * Number(perPage))
            .limit(Number(perPage))
            .sort({ createdAt: -1 });
        } else {
          questions = await EQuestion.find(filter).sort({ createdAt: -1 });
        }

        if (!questions) {
          res.status(400).json({ message: "No Empty Questions" });
          return;
        }

        const documentCount = await EQuestion.countDocuments(filter);

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
   * @desc    Update Empty Question
   * @route   /api/language/emptyQuestion/:id
   * @method  PUT
   * @access  private(only SuperAdmin) 
   ------------------------------------------------*/
  updateEmptyQuestion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateEQuestionUpdate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const question = await EQuestion.findById(req.params.id);
        if (!question) {
          res.status(400).json({ message: "Question not found" });
          return;
        }

        await EQuestion.findByIdAndUpdate(req.params.id, {
          $set: {
            level: req.body.level,
            text: req.body.text,
            correct: req.body.correct,
            word: req.body.word,
            firstAnswer: req.body.firstAnswer,
            secondAnswer: req.body.secondAnswer,
            thirdAnswer: req.body.thirdAnswer,
            forthAnswer: req.body.forthAnswer,
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
   * @desc    Delete Empty Question
   * @route   /api/language/emptyQuestion/:id
   * @method  DELETE
   * @access  private(only SuperAdmin) 
   ------------------------------------------------*/
  deleteEmptyQuestion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const question = await EQuestion.findById(req.params.id);
        if (!question) {
          res.status(400).json({ message: "Question not found" });
          return;
        }

        await EQuestion.findByIdAndDelete(req.params.id);

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

export default new EmptyController();
