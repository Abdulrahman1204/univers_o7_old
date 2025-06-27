import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import {
  Level,
  validateLevelCreate,
  validateLevelUpdate,
} from "../../../models/LanguageModel/Level";

class LevelController {
  /**-----------------------------------------------
 * @desc    Get All Level
 * @route   /api/language/level
 * @method  GET
 * @access  public 
 ------------------------------------------------*/
  getLevelCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        let levels;
        const { page, perPage, levelNumber, language } = req.query;

        const filter: any = {};

        if (levelNumber) {
          filter.levelNumber = Number(levelNumber);
        }

        if (language) {
          filter.language = language;
        }

        if (page && perPage) {
          levels = await Level.find(filter)
            .skip((Number(page) - 1) * Number(perPage))
            .limit(Number(perPage))
            .populate('language listens emptes means read_talk rank')
        
        } else {
          levels = await Level.find(filter).populate('language listens emptes means read_talk rank')
        }

        if (!levels) {
          res.status(400).json({ message: "No Levels" });
          return;
        }

        const documentCount = await Level.countDocuments(filter);

        res
          .status(200)
          .json({ levels, totalCount: levels.length, documentCount });
      } catch (err) {
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
 * @desc    Create New Level
 * @route   /api/language/level
 * @method  POST
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  createLevelCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateLevelCreate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        let levelNumber = await Level.findOne({
          levelNumber: req.body.levelNumber,
          language: req.body.language
        });
        if (levelNumber) {
          res.status(400).json({ message: "This Level Already Exist" });
          return;
        }

        levelNumber = await Level.create({
          language: req.body.language,
          levelNumber: req.body.levelNumber,
          available: req.body.available,
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
 * @desc    Update New Level
 * @route   /api/language/level/:id
 * @method  PUT
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  updateLevelCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateLevelUpdate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const levelNumber = await Level.findById(req.params.id);
        if (!levelNumber) {
          res.status(400).json({ message: "No Level" });
          return;
        }

        await Level.findByIdAndUpdate(req.params.id, {
          $set: {
            language: req.body.language,
            levelNumber: req.body.levelNumber,
            available: req.body.available,
          },
        });

        res.status(200).json({
          message: "Updated Successfuly",
        });
      } catch (err) {
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
 * @desc    Delete New Level
 * @route   /api/language/level/:id
 * @method  DELETE
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  deleteLevelCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const levelNumber = await Level.findById(req.params.id);
        if (!levelNumber) {
          res.status(400).json({ message: "No Level" });
          return;
        }

        await Level.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Deleted Successfuly" });
      } catch (err) {
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
export default new LevelController();
