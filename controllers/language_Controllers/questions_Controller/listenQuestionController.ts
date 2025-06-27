import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import {
  LQuestion,
  validateLQuestionCreate,
  validateLQuestionUpdate,
} from "../../../models/LanguageModel/ListenQuestion";
import { Level } from "../../../models/LanguageModel/Level";

class ListController {
  /**-----------------------------------------------
 * @desc    Create New Question list
 * @route   /api/language/listQuestion
 * @method  POST
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  createNewQuestoinList = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateLQuestionCreate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const level = await Level.findById(req.body.level);
        if (!level) {
          res.status(400).json({ message: "level not found" });
          return;
        }

        await LQuestion.create({
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
 * @desc    Get All Question list
 * @route   /api/language/listQuestion
 * @method  GET
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  getListenQuesiton = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        let listens;
        const { page, perPage, levelId } = req.query;

        const filter: any = {};

        if (levelId) {
          filter.level = levelId;
        }

        if (page && perPage) {
          listens = await LQuestion.find(filter)
            .skip((Number(page) - 1) * Number(perPage))
            .limit(Number(perPage))
            .sort({ createdAt: -1 });
        } else {
          listens = await LQuestion.find(filter).sort({ createdAt: -1 });
        }

        if (!listens) {
          res.status(400).json({ message: "No Listen Quesitons" });
          return;
        }

        const documentCount = await LQuestion.countDocuments(filter);

        res
          .status(200)
          .json({ listens, totalCount: listens.length, documentCount });
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
 * @desc    Update Question list
 * @route   /api/language/listQuestion/:id
 * @method  PUT
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  updateListenQuestion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateLQuestionUpdate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const listen = await LQuestion.findById(req.params.id);
        if (!listen) {
          res.status(400).json({ message: "No Quesitons" });
          return;
        }

        await LQuestion.findByIdAndUpdate(req.params.id, {
          $set: {
            level: req.body.level,
            text: req.body.text,
          },
        });

        res.status(200).json({
          message: "Updated Successfuly",
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
 * @desc    Delete Question list
 * @route   /api/language/listQuestion/:id
 * @method  Delete
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  deleteListenQieston = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const listen = await LQuestion.findById(req.params.id);
        if (!listen) {
          res.status(400).json({ message: "No Question" });
          return;
        }

        await LQuestion.findByIdAndDelete(req.params.id);

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

export default new ListController();
