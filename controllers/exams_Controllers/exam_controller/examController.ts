import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import {
  Exam,
  validateExamCreate,
  validateExamUpdate,
} from "../../../models/ExamModel/Exam/Exam";

import { validateAddExams } from "../../../models/User/Students";

import { Unit } from "../../../models/ExamModel/Unit/Unit";
import { Teacher } from "../../../models/User/Teacher";
import { Question } from "../../../models/ExamModel/Question/Question";
import { AuthenticatedRequest } from "../../../utils/types";
import { Student } from "../../../models/User/Students";
import mongoose from "mongoose";
import { Subject } from "../../../models/ExamModel/Subject/Subject";

class ExamController {
  /**-----------------------------------------------
 * @desc    Create New Exam
 * @route   /api/exam/exam
 * @method  POST
 * @access  private(only Students) 
 ------------------------------------------------*/
  generateExamCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateExamCreate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const { units, teacher, difficulty, numberOfQuestions } = req.body;
        const { user } = req as AuthenticatedRequest;

        if (!Array.isArray(units) || units.length === 0) {
          res.status(400).json({ message: "At least one unit is required" });
          return;
        }

        const foundUnits = await Unit.find({ _id: { $in: units } });
        if (foundUnits.length !== units.length) {
          res.status(404).json({ message: "One or more units not found" });
          return;
        }

        for (const unit of foundUnits) {
          if (!unit.available) {
            const student = await Student.findById(user?.id);
            if (!student) {
              res.status(404).json({ message: "Student not found" });
              return;
            }

            if (
              !student.purchasedUnits.includes(
                unit._id as mongoose.Types.ObjectId
              )
            ) {
              res.status(400).json({
                message: `Unit ${unit.unitName} is not available. Please purchase it first.`,
              });
              return;
            }
          }
        }

        const foundTeacher = await Teacher.findById(teacher);
        if (!foundTeacher) {
          res.status(404).json({ message: "Teacher not found" });
          return;
        }

        const questions = await Question.aggregate([
          {
            $match: {
              unit: { $in: units.map((id) => new mongoose.Types.ObjectId(id)) }, // Ensure proper ObjectId format
              teacher: new mongoose.Types.ObjectId(teacher),
              difficulty,
            },
          },
          {
            $sample: { size: numberOfQuestions },
          },
        ]);

        if (questions.length < numberOfQuestions) {
          res.status(400).json({
            message: `Not enough questions available. Found only ${questions.length}`,
          });
          return;
        }

        if (!questions) {
          res.status(400).json({
            message: `The details of question not available`,
          });
          return;
        }

        // Create the exam
        const student = await Student.findById(user?.id);
        if (!student) {
          res.status(404).json({ message: "Student not found" });
          return;
        }

        const exam = await Exam.create({
          units,
          teacher,
          difficulty,
          numberOfQuestions,
          questions: questions.map((q) => q._id),
          createdBy: student.id,
        });

        res.status(201).json({
          message: "Exam created successfully",
          examId: exam._id,
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
 * @desc    Get  Exam
 * @route   /api/exam/exam/:id
 * @method  GET
 * @access  private(only Students) 
 ------------------------------------------------*/
  getExamByIdCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { id } = req.params;

        const exam = await Exam.findById(id)
          .populate({
            path: "questions",
          })
          .populate({
            path: "units",
          })
          .populate({
            path: "teacher",
            populate: {
              path: "subject",
            },
          });

        if (!exam) {
          res.status(404).json({ message: "Exam not found" });
          return;
        }

        res.status(200).json({
          message: "Exam retrieved successfully",
          exam,
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
 * @desc    Add Exam 
 * @route   /api/exam/exam_student
 * @method  PUT
 * @access  private(only Students) 
 ------------------------------------------------*/
  addExamToStudent = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { exams } = req.body;

        const { user } = req as AuthenticatedRequest;

        const { error } = validateAddExams({ exams });
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const student = await Student.findById(user?.id);
        if (!student) {
          res.status(404).json({ message: "Student not found" });
          return;
        }

        for (const exam of exams) {
          const subjectExists = await Subject.findById(exam.subjectId);
          if (!subjectExists) {
            res
              .status(400)
              .json({ message: `Subject with ID ${exam.subjectId} not found` });
            return;
          }

          for (const unitId of exam.units) {
            const unitExists = await Unit.findById(unitId);
            if (!unitExists) {
              res
                .status(400)
                .json({ message: `Unit with ID ${unitId} not found` });
              return;
            }
          }
        }

        student.exams.push(...exams);
        await student.save();

        res.status(200).json({ message: "Exam added successfully", student });
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

export default new ExamController();
