import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  Language,
  validateLanguageCreate,
  validateLanguageUpdate,
} from "../../../models/LanguageModel/Language";

class LanguageController {
  /**-----------------------------------------------
 * @desc    Get All Languages
 * @route   /api/language/languages
 * @method  GET
 * @access  public 
 ------------------------------------------------*/
  getLanguagesCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        let languages;
        const { page, perPage, languageName } = req.query;

        const filter: any = {};

        if (languageName) {
          filter.languageName = { $regex: languageName, $options: "i" };
        }

        if (page && perPage) {
          languages = await Language.find(filter)
            .skip((Number(page) - 1) * Number(perPage))
            .limit(Number(perPage))
            .sort({ createdAt: -1 })
            .populate("levels")
        } else {
          languages = await Language.find(filter).sort({ createdAt: -1 }).populate("levels")
        }

        if (!languages) {
          res.status(400).json({ message: "No Languages" });
          return;
        }

        const documentCount = await Language.countDocuments(filter);

        res
          .status(200)
          .json({ languages, totalCount: languages.length, documentCount });
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
 * @desc    Create New Language
 * @route   /api/language/language
 * @method  POST
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  createLanguageCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateLanguageCreate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        let languageName = await Language.findOne({
          languageName: req.body.languageName,
        });

        if (languageName) {
          res.status(400).json({ message: "This Language Already Exist" });
          return;
        }

        languageName = await Language.create({
          languageName: req.body.languageName,
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
 * @desc    Update New Language
 * @route   /api/language/language/:id
 * @method  PUT
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  updateLanguageCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateLanguageUpdate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const languageName = await Language.findById(req.params.id);
        if (!languageName) {
          res.status(400).json({ message: "No Language" });
          return;
        }

        await Language.findByIdAndUpdate(req.params.id, {
          $set: {
            languageName: req.body.languageName,
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
 * @desc    Delete New Language
 * @route   /api/language/language/:id
 * @method  DELETE
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  deleteLanguageCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const languageName = await Language.findById(req.params.id);
        if (!languageName) {
          res.status(400).json({ message: "No Language" });
          return;
        }

        await Language.findByIdAndDelete(req.params.id);

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

export default new LanguageController();
