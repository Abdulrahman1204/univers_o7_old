import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";

import {
  User,
  validateLoginUser,
  validateRegisterUser,
  validateRegisterDash,
} from "../../models/User/User";
import { Teacher, validateRegisterTeacher } from "../../models/User/Teacher";
import {
  Student,
  validateLoginStudent,
  validateRegisterStudent,
} from "../../models/User/Students";
import { Subject } from "../../models/ExamModel/Subject/Subject";
import { generateJWT } from "../../utils/generateToken";
import { Types } from "mongoose";

class AuthController {
  // For Dashboard ----------------------------------------------------
  /**-----------------------------------------------
 * @desc    Register For Dashboard
 * @route   /api/auth/dashadmin/register
 * @method  POST
 * @access  public 
 ------------------------------------------------*/
  registerDashCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateRegisterDash(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        let user = await User.findOne({ phoneNumber: req.body.phoneNumber });
        if (user) {
          res.status(400).json({ message: "Phone number already exists" });
          return;
        }


        user = await User.create({
          userName: req.body.userName.trim(),
          phoneNumber: req.body.phoneNumber.trim(),
          password: req.body.password,
          gender: req.body.gender,
          role: req.body.role,
          age: req.body.age,
        });

        res.status(201).json({
          message: "Successfully Registered",
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
 * @desc    Register New Teacher
 * @route   /api/auth/teacher/register
 * @method  POST
 * @access  public 
 ------------------------------------------------*/
  registerTeacherDashCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateRegisterTeacher(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        let teacher = await Teacher.findOne({
          phoneNumber: req.body.phoneNumber,
        });
        if (teacher) {
          res.status(400).json({ message: "Phone number already exists" });
          return;
        }

        if (req.body.role !== "teacher") {
          res.status(400).json({ message: "not allowed, just for teachers" });
          return;
        }

        let sub = await Subject.findById(req.body.subject);
        if (!sub) {
          res.status(400).json({ message: "Subject not found" });
          return;
        }
    

        teacher = await Teacher.create({
          userName: req.body.userName,
          phoneNumber: req.body.phoneNumber,
          subject: req.body.subject,
          password: req.body.password,
          gender: req.body.gender,
          role: req.body.role,
          age: req.body.age,
        });

        res.status(201).json({
          message: "Successfully Registered",
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
 * @desc    login For Dashboard
 * @route   /api/auth/dashadmin/login
 * @method  POST
 * @access  public 
 ------------------------------------------------*/
  loginDashCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateLoginUser(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const { phoneNumber, password } = req.body;

        const user = await User.findOne({ phoneNumber });
        const teacher = await Teacher.findOne({ phoneNumber });

        if (!user && !teacher) {
          res.status(400).json({ message: "Invalid phone number or password" });
          return;
        }

        const entity = (user || teacher) as {
          userName: string;
          _id: string;
          role: string;
          password: string;
        };

        if (!entity) {
          res.status(400).json({ message: "Invalid Entity" });
          return;
        }

        const isPasswordMatch = await bcrypt.compare(password, entity.password);
        if (!isPasswordMatch) {
          res.status(400).json({ message: "Invalid phone number or password" });
          return;
        }

        const token = generateJWT({
          userName: entity.userName,
          id: entity._id.toString(),
          role: entity.role,
        });

        res.cookie("jwtToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 30 * 1000,
        });

        res.status(201).json({
          message: "Login Successfully",
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

  // For Dashboard ----------------------------------------------------

  // For Student ----------------------------------------------------

  /**-----------------------------------------------
 * @desc    Register New User
 * @route   /api/auth/register
 * @method  POST
 * @access  public 
 ------------------------------------------------*/
  registerUserCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateRegisterStudent(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        let student = await Student.findOne({
          phoneNumber: req.body.phoneNumber,
        });
        if (student) {
          res.status(400).json({ message: "Phone number already exists" });
          return;
        }

        if (req.body.role != "student") {
          res
            .status(400)
            .json({ message: "you are not allowed, just for students" });
          return;
        }

        if (!req.file) {
          res.status(400).json({ message: "Profile photo is required" });
          return;
        }

        const profilePhoto = req.file
          ? {
              url: req.file.path,
              publicId: req.file.filename,
            }
          : undefined;

        student = await Student.create({
          userName: req.body.userName.trim(),
          phoneNumber: req.body.phoneNumber.trim(),
          questions: req.body.questions,
          password: req.body.password,
          gender: req.body.gender,
          role: "student",
          age: req.body.age,
          profilePhoto,
        });

        const token = generateJWT({
          userName: student.userName,
          id: (student._id as Types.ObjectId).toString(),
          role: student.role,
        });

        res.cookie("jwtToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 30 * 1000,
        });

        res.status(201).json({
          message: "Successfully Registered",
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
* @desc    Login User
* @route   /api/auth/login
* @method  POST
* @access  public 
------------------------------------------------*/
  loginUserCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateLoginStudent(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        let user = await Student.findOne({ phoneNumber: req.body.phoneNumber });
        if (!user) {
          res.status(400).json({ message: "Invalid phone number or password" });
          return;
        }

        const isPasswordMatch = await bcrypt.compare(
          req.body.password,
          user.password
        );

        if (!isPasswordMatch) {
          res.status(400).json({ message: "Invalid phone number or password" });
          return;
        }

        const token = generateJWT({
          userName: user.userName,
          id: (user._id as Types.ObjectId).toString(),
          role: user.role,
        });

        res.cookie("jwtToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 30 * 1000,
        });

        res.status(201).json({
          message: "Login Successfuly",
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

  // For Student ----------------------------------------------------

  // For All ----------------------------------------------------

  /**-----------------------------------------------
 * @desc    logout 
 * @route   /api/auth/logout
 * @method  GET
 * @access  public 
 ------------------------------------------------*/
  logoutCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        res.clearCookie("jwtToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
          path: "/",
        });

        res.status(200).json({
          message: "Successfully logged out",
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Error occurred during logout:", err.message);
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

  // For All ----------------------------------------------------
}

export default new AuthController();
