import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { QrPayment, QrPaymentSchema } from "../models/QrPayment";
import mongoose from "mongoose";
import { Course } from "../models/CoursesModel/Courses/Courses";
import { Unit } from "../models/ExamModel/Unit/Unit";
import QRCode from "qrcode";
import { Student } from "../models/User/Students";
import { AuthenticatedRequest } from "../utils/types";
import { Level } from "../models/LanguageModel/Level";
class QrPaymentController {
  /**-----------------------------------------------
 * @desc    Generate Qr Code
 * @route   /api/generate-qr/unit/678fa3956bf4e82dc547438e
 * @method  GET
 * @access  private(only admin and superAdmin and sales)
 ------------------------------------------------*/
  generatePaymentQr = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { id, type } = req.params;

        let entity;
        if (type === "course") {
          entity = await Course.findById(id);
        } else if (type === "unit") {
          entity = await Unit.findById(id);
        } else if (type === "level") {
          entity = await Level.findById(id);
        } else {
          res.status(400).json({
            message: "Invalid type. Must be 'course' or 'unit' or 'language'.",
          });
          return;
        }

        if (!entity) {
          res.status(404).json({ message: `${type} not found.` });
          return;
        }

        const uniqueCode = new mongoose.Types.ObjectId().toHexString(); // Unique code for one-time use
        const qrData = {
          type,
          entityId: entity._id,
          uniqueCode,
        };

        const qrCodeSvg = await QRCode.toString(JSON.stringify(qrData), {
          type: "svg",
          errorCorrectionLevel: "H",
          width: 300,
        });

        const textSvg = `
        <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect x="85" y="125" width="130" height="50" rx="10" fill="white" />
          <text x="150" y="155" font-family="Arial, sans-serif" font-size="16" fill="black" text-anchor="middle" alignment-baseline="middle" font-weight="bold">
            Universe_o7
          </text>
        </svg>
      `;

        const combinedSvg = `
        <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
          <g>${qrCodeSvg}</g>
          <g>${textSvg}</g> 
        </svg>
      `;

        const qrPayment = new QrPayment({
          type,
          entityId: entity._id,
          uniqueCode,
          used: false,
        });

        await qrPayment.save();

        res.writeHead(200, {
          "Content-Type": "image/svg+xml",
          "Content-Length": Buffer.byteLength(combinedSvg),
        });
        res.end(combinedSvg);
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
 * @desc    purchase Unit
 * @route   /api/generate-qr/unit/678fa3956bf4e82dc547438e
 * @method  POST
 * @access  private(only student)
 ------------------------------------------------*/
  processPayment = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { qrData } = req.body;

        const { type, entityId, uniqueCode } = JSON.parse(qrData);

        const qrPayment = await QrPayment.findOne({
          entityId,
          uniqueCode,
          used: false,
        });

        if (!qrPayment) {
          res.status(400).json({ message: "Invalid or already used QR code." });
          return;
        }

        qrPayment.used = true;
        await qrPayment.save();

        const { user } = req as AuthenticatedRequest;
        const student = await Student.findById(user?.id);

        if (!student) {
          res.status(404).json({ message: "Student not found." });
          return;
        }

        if (type === "course") {
          const course = await Course.findById(entityId);
          if (!course) {
            res.status(404).json({ message: "Course not found." });
            return;
          }

          await Student.findByIdAndUpdate(
            user?.id,
            {
              $push: { purchasedCourses: course._id },
            },
            { new: true }
          );

          res.status(200).json({ message: "Course purchased successfully." });
        } else if (type === "unit") {
          const unit = await Unit.findById(entityId);
          if (!unit) {
            res.status(404).json({ message: "Unit not found." });
            return;
          }

          await Student.findByIdAndUpdate(
            user?.id,
            {
              $push: { purchasedUnits: unit._id },
            },
            { new: true }
          );

          res.status(200).json({ message: "Unit purchased successfully." });
        } else if (type === "level") {
          const level = await Level.findById(entityId);
          if (!level) {
            res.status(404).json({ message: "Level not found." });
            return;
          }

          await Student.findByIdAndUpdate(
            user?.id,
            {
              $push: { purchasedLanguages: level._id },
            },
            { new: true }
          );

          res.status(200).json({ message: "Level purchased successfully." });
        } else {
          res.status(400).json({
            message: "Invalid type. Must be 'course' or 'unit' or 'level'.",
          });
        }
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

export default new QrPaymentController();
