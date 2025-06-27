import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  RQuestion,
  validateRQuestionCreate,
  validateRQuestionUpdate,
} from "../../../models/LanguageModel/RankQuestion";
import { Level } from "../../../models/LanguageModel/Level";

class RController {
  /**-----------------------------------------------
   * @desc    Create New Ranking Question
   * @route   /api/language/rankingQuestion
   * @method  POST
   * @access  private (only SuperAdmin)
   ------------------------------------------------*/
  createNewQuestion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateRQuestionCreate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const level = await Level.findById(req.body.level);
        if (!level) {
          res.status(400).json({ message: "Level not found" });
          return;
        }

        await RQuestion.create({
          level: req.body.level,
          text: req.body.text,
        });

        res.status(201).json({
          message: "Ranking Question Created Successfully",
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
   * @desc    Get All Ranking Questions
   * @route   /api/language/rankingQuestion
   * @method  GET
   * @access  private (only SuperAdmin)
   ------------------------------------------------*/
  getRQuestions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        let questions;
        const { page, perPage, levelId } = req.query;

        const filter: any = {};

        if (levelId) {
          filter.level = levelId;
        }

        if (page && perPage) {
          questions = await RQuestion.find(filter)
            .skip((Number(page) - 1) * Number(perPage))
            .limit(Number(perPage))
            .sort({ createdAt: -1 });
        } else {
          questions = await RQuestion.find(filter).sort({ createdAt: -1 });
        }

        if (!questions || questions.length === 0) {
          res.status(404).json({ message: "No Ranking Questions found" });
          return;
        }

        const documentCount = await RQuestion.countDocuments(filter);

        res.status(200).json({
          questions,
          totalCount: questions.length,
          documentCount,
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
   * @desc    Update Ranking Question
   * @route   /api/language/rankingQuestion/:id
   * @method  PUT
   * @access  private (only SuperAdmin)
   ------------------------------------------------*/
  updateRQuestion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateRQuestionUpdate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const question = await RQuestion.findById(req.params.id);
        if (!question) {
          res.status(404).json({ message: "Ranking Question not found" });
          return;
        }

        await RQuestion.findByIdAndUpdate(
          req.params.id,
          {
            $set: {
              text: req.body.text,
            },
          },
          { new: true }
        );

        res.status(200).json({
          message: "Ranking Question Updated Successfully",
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
   * @desc    Delete Ranking Question
   * @route   /api/language/rankingQuestion/:id
   * @method  DELETE
   * @access  private (only SuperAdmin)
   ------------------------------------------------*/
  deleteRQuestion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const question = await RQuestion.findById(req.params.id);
        if (!question) {
          res.status(404).json({ message: "Ranking Question not found" });
          return;
        }

        await RQuestion.findByIdAndDelete(req.params.id);

        res.status(200).json({
          message: "Ranking Question Deleted Successfully",
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
}

export default new RController();