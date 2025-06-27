import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { Student, validateFavouriteQ } from "../../models/User/Students";
import { Question } from "../../models/ExamModel/Question/Question";
import { AuthenticatedRequest } from "../../utils/types";
import mongoose from "mongoose";
import { Teacher } from "../../models/User/Teacher";

class FavouriteController {
  /**-----------------------------------------------
   * @desc    Create or remove a favorite question
   * @route   /api/fav
   * @method  PUT
   * @access  public (User Token)
   ------------------------------------------------*/
   createFavCtrl = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { error } = validateFavouriteQ(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }
  
    const { user } = req as AuthenticatedRequest;
  
    const question = await Question.findById(req.body.questions);
    if (!question) {
      res.status(400).json({ message: "Question not found" });
      return;
    }
  
    const student = await Student.findById(user?.id);
    const teacher = await Teacher.findById(user?.id);

    if (!user && !teacher) {
      res.status(404).json({ message: "not found" });
      return;
    }
  
    const entity = (student || teacher) as {
      _id: string;
      questions: mongoose.Types.ObjectId[];
    };
    
    const isQuestionAlreadySaved = entity.questions.some(
      (favs: mongoose.Types.ObjectId) => favs.toString() === req.body.questions
    );
  
    if (isQuestionAlreadySaved) {
      if (student) {
        await Student.findByIdAndUpdate(
          user?.id,
          { $pull: { questions: req.body.questions } },
          { new: true }
        );
      } else {
        await Teacher.findByIdAndUpdate(
          user?.id,
          { $pull: { questions: req.body.questions } },
          { new: true }
        );
      }
      res.status(200).json({ message: "Question removed from favorites" });
    } else {
      if (student) {
        await Student.findByIdAndUpdate(
          user?.id,
          { $push: { questions: new mongoose.Types.ObjectId(req.body.questions) } },
          { new: true }
        );
      } else {
        await Teacher.findByIdAndUpdate(
          user?.id,
          { $push: { questions: new mongoose.Types.ObjectId(req.body.questions) } },
          { new: true }
        );
      }
      res.status(200).json({ message: "Question added to favorites" });
    }
  });
}

export default new FavouriteController();
