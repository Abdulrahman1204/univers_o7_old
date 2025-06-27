import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import {
  Comment,
  validateCommentCreate,
  validateCommentUpdate,
} from "../../../models/ExamModel/Comment/Comment";
import { Question } from "../../../models/ExamModel/Question/Question";
import { AuthenticatedRequest } from "../../../utils/types";
import { Student } from "../../../models/User/Students";

class CommentController {
  /**-----------------------------------------------
 * @desc    Get All Comment
 * @route   /api/exam/comment
 * @method  GET
 * @access  public 
 ------------------------------------------------*/
  getCommentCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        let comments;
        const { page, perPage, studentId, questionId } = req.query;

        const filter: any = {};

        if (studentId) {
          filter.student = studentId;
        }

        if (questionId) {
          filter.question = questionId;
        }

        if (page && perPage) {
          comments = await Comment.find(filter)
            .skip((Number(page) - 1) * Number(perPage))
            .limit(Number(perPage))
            .sort({ createdAt: -1 });
        } else {
          comments = await Comment.find(filter).sort({ createdAt: -1 });
        }

        const documentCount = await Comment.countDocuments(filter);

        res
          .status(200)
          .json({ comments, totalCount: comments.length, documentCount });
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
 * @desc    Create New Comment
 * @route   /api/exam/comment
 * @method  POST
 * @access  private(only Student) 
 ------------------------------------------------*/
  createCommentCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateCommentCreate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const { user } = req as AuthenticatedRequest;

        const question = await Question.findById(req.body.question);
        if (!question) {
          res.status(400).json({ message: "Question Not Found" });
        }

        const student = await Student.findById(user?.id);
        if (!student) {
          res.status(400).json({ message: "Student Not Found" });
        }

        const newcomment = await Comment.create({
          question: req.body.question,
          student: user?.id,
          comment: req.body.comment,
        });

        res.status(201).json({
          message: "Create Comment",
          commentId: newcomment._id
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
 * @desc    Update Comment
 * @route   /api/exam/comment/:id
 * @method  POST
 * @access  private(only Student) 
 ------------------------------------------------*/
  updateCommentCtrt = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { error } = validateCommentUpdate(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }

      const { user } = req as AuthenticatedRequest;

      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        res.status(400).json({ message: "No Comment" });
        return;
      }

      if (comment?.student.toString() != user?.id) {
        res.status(400).json({ message: "Not Allow" });
        return;
      }

      await Comment.findByIdAndUpdate(req.params.id, {
        $set: {
          comment: req.body.comment,
        },
      });

      res.status(200).json({
        message: "Updated Successfuly",
      });
    }
  );

  /**-----------------------------------------------
 * @desc    Delete comment
 * @route   /api/exam/comment/:id
 * @method  DELETE
 * @access  private(only SuperAdmin or admin or student)
 ------------------------------------------------*/
  deleteCommentCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        res.status(400).json({ message: "No Comment" });
        return;
      }

      const { user } = req as AuthenticatedRequest;


      if (comment?.student.toString() != user?.id || user?.role === 'admin' || user?.role === 'superAdmin') {
        res.status(400).json({ message: "Not Allow" });
        return;
      }

      await Comment.findByIdAndDelete(req.params.id)

      res.status(200).json({ message: "Deleted Successfuly" });
    }
  );
}

export default new CommentController();
