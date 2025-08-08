import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { User, validateUpdateUserProfile } from "../../models/User/User";
import { Teacher } from "../../models/User/Teacher"; // Import the Teacher model
import { AuthenticatedRequest } from "../../utils/types";
import { Student } from "../../models/User/Students";

class ProfileController {
  /**-----------------------------------------------
   * @desc    Get Profile (User or Teacher)
   * @route   /api/ctrl/profile
   * @method  GET
   * @access  private (only User/Teacher Himself) 
   ------------------------------------------------*/
  getProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { user } = req as AuthenticatedRequest;

        const entity =
          (await User.findById(user?.id).select(
            "-password -createdAt -updatedAt -__v"
          )) ||
          (await Teacher.findById(user?.id)
            .select("-password -createdAt -updatedAt -__v")
            .populate(
              "subject questions",
              "subjectName questionText difficulty questionType"
            )) ||
          (await Student.findById(user?.id)
            .select("-password -createdAt -updatedAt -__v")
            .populate({
              path: "questions",
              populate: {
                path: "comments",
              },
            })
            .populate({
              path: "exams",
              populate: {
                path: "subjectId units",
              },
            }));

        if (!entity) {
          res.status(400).json({ message: "Profile not found" });
          return;
        }

        res.status(200).json(entity);
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
   * @desc    Delete Profile (User or Teacher)
   * @route   /api/ctrl/profile/:id
   * @method  DELETE
   * @access  private (only User/Teacher Himself or Admin) 
   ------------------------------------------------*/
  deleteProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { id } = req.params;

        const entity =
          (await User.findById(id)) ||
          (await Teacher.findById(id)) ||
          (await Student.findById(id));

        if (!entity) {
          res.status(400).json({ message: "Profile not found" });
          return;
        }

        await (entity instanceof User
          ? User.findByIdAndDelete(id)
          : entity instanceof Teacher
          ? Teacher.findByIdAndDelete(id)
          : Student.findByIdAndDelete(id));

        res.status(200).json({ message: "Deleted successfully" });
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
   * @desc    Update Profile (User or Teacher)
   * @route   /api/ctrl/profile/:id
   * @method  PUT
   * @access  private (only User/Teacher Himself) 
   ------------------------------------------------*/
  updateProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateUpdateUserProfile(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const user = req.params.id;

        const entity =
          (await User.findById(user)) ||
          (await Teacher.findById(user)) ||
          (await Student.findById(user));

        if (!entity) {
          res.status(400).json({ message: "Profile not found" });
          return;
        }

        const updatedData = {
          userName: req.body.userName,
          phoneNumber: req.body.phoneNumber,
          gender: req.body.gender,
          age: req.body.age,
        };

        await (entity instanceof User
          ? User.findByIdAndUpdate(user, { $set: updatedData })
          : entity instanceof Teacher
          ? Teacher.findByIdAndUpdate(user, { $set: updatedData })
          : Student.findByIdAndUpdate(user, { $set: updatedData }));

        res.status(200).json({ message: "Updated successfully" });
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

export default new ProfileController();
