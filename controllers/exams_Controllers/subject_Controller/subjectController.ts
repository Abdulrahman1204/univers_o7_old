import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import {
  Subject,
  validateSubjectCreate,
  validateSubjectUpdate,
} from "../../../models/ExamModel/Subject/Subject";

class SubjectController {
  /**-----------------------------------------------
 * @desc    Get All Subject
 * @route   /api/exam/subject
 * @method  GET
 * @access  public 
 ------------------------------------------------*/
  getSubjectCtr = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        let subjects;
        const { page, perPage, subjectName, classId } = req.query;

        const filter: any = {};

        if (subjectName) {
          filter.subjectName = { $regex: new RegExp(String(subjectName), "i") };
        }

        if (classId) {
          filter.class = classId
        }

        if (page && perPage) {
          subjects = await Subject.find(filter)
            .skip((Number(page) - 1) * Number(perPage))
            .limit(Number(perPage))
            .sort({ createdAt: -1 })
            .populate("class")
            .populate('units')
            .populate('teacher')
        } else {
          subjects = await Subject.find(filter)
            .sort({ createdAt: -1 })
            .populate("class")
            .populate('units')
            .populate('teacher')
        }

        if (!subjects) {
          res.status(400).json({ message: "No Subjects" });
          return;
        }

        const documentCount = await Subject.countDocuments(filter);

        res
          .status(200)
          .json({ subjects, totalCount: subjects.length, documentCount });
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
 * @desc    Create New Subject
 * @route   /api/exam/subject
 * @method  POST
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  createSubjectCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateSubjectCreate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        let subjectName = await Subject.findOne({
          subjectName: req.body.subjectName,
        });
        if (subjectName) {
          res.status(400).json({ message: "This Subject Already Exist" });
          return;
        }

        subjectName = await Subject.create({
          subjectName: req.body.subjectName,
          class: req.body.class,
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
 * @desc    Update Subject
 * @route   /api/exam/subject/:id
 * @method  PUT
 * @access  private(only SuperAdmin)
 ------------------------------------------------*/
  updateSubjectCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateSubjectUpdate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const subjectName = await Subject.findById(req.params.id);
        if (!subjectName) {
          res.status(400).json({ message: "No Subject" });
          return;
        }

        let Name = await Subject.findOne({
          subjectName: req.body.subjectName,
        });
        if (Name) {
          res.status(400).json({ message: "This Subject Already Exist" });
          return;
        }

        await Subject.findByIdAndUpdate(req.params.id, {
          $set: {
            subjectName: req.body.subjectName,
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
  deleteSubjectCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const subjectName = await Subject.findById(req.params.id);
        if (!subjectName) {
          res.status(400).json({ message: "No Subject" });
          return;
        }

        await Subject.findByIdAndDelete(req.params.id);

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

export default new SubjectController();
