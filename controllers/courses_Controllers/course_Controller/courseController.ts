import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import {
  Course,
  validateCourseCreate,
  validateCourseUpdate,
} from "../../../models/CoursesModel/Courses/Courses";
import { Subject } from "../../../models/ExamModel/Subject/Subject";
import { Teacher } from "../../../models/User/Teacher";

class CourseController {
  /**-----------------------------------------------
 * @desc    Get All Course
 * @route   /api/view/course
 * @method  GET
 * @access  public 
 ------------------------------------------------*/
  getCoursesCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { subjectId, teacherId, courseName, InstituteName } = req.query;

        let filter: any = {};

        if (courseName) {
          filter.courseName = { $regex: courseName, $options: "i" }; // Case-insensitive search
        }

        if (InstituteName) {
          filter.InstituteName = { $regex: InstituteName, $options: "i" }; // Case-insensitive search
        }

        if (subjectId) {
          const subject = await Subject.findById(subjectId);
          if (subject) {
            filter.subject = subjectId;
          } else {
            res.status(404).json({ message: "Subject not found" });
            return;
          }
        }

        if (teacherId) {
          const teacher = await Teacher.findById(teacherId);
          if (teacher) {
            filter.teacher = teacherId;
          } else {
            res.status(404).json({ message: "Teacher not found" });
            return;
          }
        }

        const courses = await Course.find(filter)
          .populate("teacher")
          .populate("subject");

        res.status(200).json({ courses, totalCount: courses.length });
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
 * @desc    Create New Course
 * @route   /api/view/course
 * @method  POST
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  createCourseCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateCourseCreate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const {
          courseName,
          teacher,
          subject,
          InstituteName,
          available,
          videos,
        } = req.body;

        const existingCourse = await Course.findOne({
          courseName,
          teacher,
          subject,
        });
        if (existingCourse) {
          res.status(400).json({
            message:
              "Course with the same name, teacher, and subject already exists",
          });
          return;
        }

        const subjectExists = await Subject.findById(subject);
        if (!subjectExists) {
          res.status(404).json({ message: "Subject not found" });
          return;
        }

        const teacherExists = await Teacher.findById(teacher);
        if (!teacherExists) {
          res.status(404).json({ message: "Teacher not found" });
          return;
        }

        const newCourse = await Course.create({
          courseName,
          teacher,
          subject,
          InstituteName,
          available,
          videos,
        });

        res
          .status(201)
          .json({ message: "Course created successfully", course: newCourse });
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
 * @desc    Delete Course
 * @route   /api/view/course/:id
 * @method  DELETE
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  deleteCourseCtrl = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      const course = await Course.findById(id);

      if (!course) {
        res.status(404).json({ message: "Course not found" });
        return;
      }

      await course.deleteOne();

      res.status(200).json({ message: "Course deleted successfully" });
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
  });

  /**-----------------------------------------------
 * @desc    Update Course
 * @route   /api/view/course/:id
 * @method  PUT
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  updateCourseCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateCourseUpdate(req.body); // You'll need to create this validation
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const { id } = req.params;
        const {
          courseName,
          teacher,
          subject,
          InstituteName,
          available,
          videos,
        } = req.body;

        // Check if course exists
        const existingCourse = await Course.findById(id);
        if (!existingCourse) {
          res.status(404).json({ message: "Course not found" });
          return;
        }

        // Check for duplicate course (same name, teacher, and subject)
        if (courseName || teacher || subject) {
          const duplicateCourse = await Course.findOne({
            _id: { $ne: id }, // Exclude current course from check
            courseName: courseName || existingCourse.courseName,
            teacher: teacher || existingCourse.teacher,
            subject: subject || existingCourse.subject,
          });

          if (duplicateCourse) {
            res.status(400).json({
              message:
                "Another course with the same name, teacher, and subject already exists",
            });
            return;
          }
        }

        // Validate subject exists if being updated
        if (subject && subject !== existingCourse.subject.toString()) {
          const subjectExists = await Subject.findById(subject);
          if (!subjectExists) {
            res.status(404).json({ message: "Subject not found" });
            return;
          }
        }

        // Validate teacher exists if being updated
        if (teacher && teacher !== existingCourse.teacher.toString()) {
          const teacherExists = await Teacher.findById(teacher);
          if (!teacherExists) {
            res.status(404).json({ message: "Teacher not found" });
            return;
          }
        }

        // Prepare update object
        const updateData: any = {
          courseName: courseName || existingCourse.courseName,
          teacher: teacher || existingCourse.teacher,
          subject: subject || existingCourse.subject,
          InstituteName: InstituteName || existingCourse.InstituteName,
          available:
            available !== undefined ? available : existingCourse.available,
        };

        // Handle videos update if provided
        if (videos) {
          updateData.videos = videos;
        }

        const updatedCourse = await Course.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        });

        res.status(200).json({
          message: "Course updated successfully",
          course: updatedCourse,
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
}

export default new CourseController();
