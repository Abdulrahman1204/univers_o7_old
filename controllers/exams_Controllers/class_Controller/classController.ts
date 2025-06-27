import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import {
  Class,
  validateClassCreate,
  validateClassUpdate,
} from "../../../models/ExamModel/Class/Class";

class ClassController {
  /**-----------------------------------------------
 * @desc    Get All Class
 * @route   /api/exam/class
 * @method  GET
 * @access  public 
 ------------------------------------------------*/
  getClassesCtr = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        let classes;
        const { page, perPage, className } = req.query;

        const filter: any = {};

        if (className) {
          filter.className = { $regex: new RegExp(String(className), "i") };
        }

        if (page && perPage) {
          classes = await Class.find(filter)
            .skip((Number(page) - 1) * Number(perPage))
            .limit(Number(perPage))
            .sort({ createdAt: -1 })
            .populate('subjects')
        } else {
          classes = await Class.find(filter).sort({ createdAt: -1 }).populate('subjects')
        }

        if(!classes) {
          res.status(400).json({ message: 'No Classes' })
          return;
        }

        const documentCount = await Class.countDocuments(filter)

        res.status(200).json({classes, totalCount: classes.length, documentCount})
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
 * @desc    Create New Class
 * @route   /api/exam/class
 * @method  POST
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  createClassCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateClassCreate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        let className = await Class.findOne({ className: req.body.className });
        if (className) {
          res.status(400).json({ message: "This Class Already Exist" });
          return;
        }

        className = await Class.create({
          className: req.body.className,
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
 * @desc    Update Class
 * @route   /api/exam/class/:id
 * @method  PUT
 * @access  private(only SuperAdmin)
 ------------------------------------------------*/
  updateClassCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateClassUpdate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const className = await Class.findById(req.params.id);
        if (!className) {
          res.status(400).json({ message: "No Class" });
          return;
        }

        await Class.findByIdAndUpdate(req.params.id, {
          $set: {
            className: req.body.className,
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
 * @desc    Delete Class
 * @route   /api/exam/class/:id
 * @method  DELETE
 * @access  private(only SuperAdmin)
 ------------------------------------------------*/
  deleteClassCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const className = await Class.findById(req.params.id);
        if (!className) {
          res.status(400).json({ message: "No Class" });
          return;
        }

        await Class.findByIdAndDelete(req.params.id);

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

export default new ClassController();
