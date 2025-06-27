import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { User } from "../../models/User/User";
import { Teacher } from "../../models/User/Teacher";
import { Student } from "../../models/User/Students";

class UserController {
  /**-----------------------------------------------
     * @desc    Get All Users By filter 
     * @route   /api/ctrl/users/dash
     * @method  GET
     * @access  private (only superAdmin) 
     ------------------------------------------------*/
  getUsersCtrl = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {

      let users;

      const { page, perPage, role, userName } = req.query;

      const filter: any = {};

      if (userName) {
        filter.userName = { $regex: new RegExp(String(userName), "i") };
      }

      if (role) {
        filter.role = { $in: [role] };
      }

      if (page && perPage) {
        users = await User.find(filter)
          .skip((Number(page) - 1) * Number(perPage))
          .limit(Number(perPage))
          .sort({ createdAt: -1 })
          .select('-password -createdAt -updatedAt -__v -profilePhoto')
      } else {
        users = await User.find(filter).sort({ createAt: -1 }).select('-password -createdAt -updatedAt -__v -profilePhoto');
      }

      if (!users) {
        res.status(400).json({ message: "No Users" });
        return;
      }

      const documentCount = await User.countDocuments(filter)

      res.status(200).json({users, totalCount: users.length, documentCount});

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
  });

   /**-----------------------------------------------
     * @desc    Get All Teachers By filter 
     * @route   /api/ctrl/teachers/dash
     * @method  GET
     * @access  private (only superAdmin) 
     ------------------------------------------------*/
     getTeachersCtrl = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      try {
  
        let teachers;
        
        const { page, perPage, userName, subjectId } = req.query;
        
        const filter: any = {};
  
        if (userName) {
          filter.userName = { $regex: new RegExp(String(userName), "i") };
        }

        if (subjectId) {
          filter.subject = subjectId
        }
        
        if (page && perPage) {
          teachers = await Teacher.find(filter)
            .skip((Number(page) - 1) * Number(perPage))
            .limit(Number(perPage))
            .sort({ createdAt: -1 })
            .select('-password -createdAt -updatedAt -__v -profilePhoto')
            .populate('subject')
        } else {
          teachers = await Teacher.find(filter).sort({ createdAt: -1 }).select('-password -createdAt -updatedAt -__v -profilePhoto').populate('subject questions')
        }
  
        if (!teachers) {
          res.status(400).json({ message: "No Teachers" });
          return;
        }
  
        const documentCount = await Teacher.countDocuments(filter)
  
        res.status(200).json({teachers, totalCount: teachers.length, documentCount});
  
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
    });

    /**-----------------------------------------------
     * @desc    Get All Students By filter 
     * @route   /api/ctrl/students/dash
     * @method  GET
     * @access  private (only superAdmin) 
     ------------------------------------------------*/
     getStudentsCtrl = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      try {
  
        let students;
        
        const { page, perPage, userName } = req.query;
        
        const filter: any = {};
  
        if (userName) {
          filter.userName = { $regex: new RegExp(String(userName), "i") };
        }
        
        if (page && perPage) {
          students = await Student.find(filter)
            .skip((Number(page) - 1) * Number(perPage))
            .limit(Number(perPage))
            .sort({ createdAt: -1 })
            .select('-password -createdAt -updatedAt -__v -profilePhoto')
        } else {
          students = await Student.find(filter).sort({ createAt: -1 }).select('-password -createdAt -updatedAt -__v -profilePhoto')
        }
  
        if (!students) {
          res.status(400).json({ message: "No Students" });
          return;
        }
  
        const documentCount = await Student.countDocuments(filter)
  
        res.status(200).json({students, totalCount: students.length, documentCount});
  
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
    });
}

export default new UserController();
