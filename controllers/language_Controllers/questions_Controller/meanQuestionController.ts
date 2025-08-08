import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  MQuestion,
  validateEQuestionCreate,
  validateEQuestionUpdate,
} from "../../../models/LanguageModel/MeanQuestion";
import { Level } from "../../../models/LanguageModel/Level";

class MeanController {
  /**-----------------------------------------------
   * @desc    Create New Mean Question
   * @route   /api/language/meanQuestion
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

        await MQuestion.create({
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
   * @desc    Get All Mean Questions
   * @route   /api/language/meanQuestion
   * @method  GET
   * @access  private(only SuperAdmin) 
   ------------------------------------------------*/
  getMeanQuestions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        let questions;
        const { page, perPage, levelId } = req.query;

        const filter: any = {};

        if (levelId) {
          filter.level = levelId;
        }

        if (page && perPage) {
          questions = await MQuestion.find(filter)
            .skip((Number(page) - 1) * Number(perPage))
            .limit(Number(perPage))
            .sort({ createdAt: -1 });
        } else {
          questions = await MQuestion.find(filter).sort({ createdAt: -1 });
        }

        if (!questions) {
          res.status(400).json({ message: "No Mean Questions" });
          return;
        }

        const documentCount = await MQuestion.countDocuments(filter);

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
   * @desc    Update Mean Question
   * @route   /api/language/meanQuestion/:id
   * @method  PUT
   * @access  private(only SuperAdmin) 
   ------------------------------------------------*/
  updateMeanQuestion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateEQuestionUpdate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const question = await MQuestion.findById(req.params.id);
        if (!question) {
          res.status(400).json({ message: "Question not found" });
          return;
        }

        await MQuestion.findByIdAndUpdate(req.params.id, {
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
   * @desc    Delete Mean Question
   * @route   /api/language/meanQuestion/:id
   * @method  DELETE
   * @access  private(only SuperAdmin) 
   ------------------------------------------------*/
  deleteMeanQuestion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const question = await MQuestion.findById(req.params.id);
        if (!question) {
          res.status(400).json({ message: "Question not found" });
          return;
        }

        await MQuestion.findByIdAndDelete(req.params.id);

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

export default new MeanController();
