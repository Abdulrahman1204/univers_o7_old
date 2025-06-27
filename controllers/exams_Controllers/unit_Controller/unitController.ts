import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import QRCode from "qrcode";
import {
  Unit,
  validateUnitCreate,
  validateUnitUpdate,
} from "../../../models/ExamModel/Unit/Unit";
import { Student } from "../../../models/User/Students";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../../../utils/types";
import { Jimp } from "jimp";
import sharp from "sharp";

class UnitController {
  /**-----------------------------------------------
 * @desc    Get All Units
 * @route   /api/exam/unit
 * @method  GET
 * @access  public 
 ------------------------------------------------*/
  getUnitCtr = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        let units;
        const { page, perPage, unitName, subjecId } = req.query;

        const filter: any = {};

        if (unitName) {
          filter.unitName = { $regex: new RegExp(String(unitName), "i") };
        }

        if (subjecId) {
          filter.subject = subjecId;
        }

        if (page && perPage) {
          units = await Unit.find(filter)
            .skip((Number(page) - 1) * Number(perPage))
            .limit(Number(perPage))
            .sort({ createdAt: -1 })
            .populate("questions")
            .populate("subject");
        } else {
          units = await Unit.find(filter)
            .sort({ createdAt: -1 })
            .populate("questions")
            .populate("subject");
        }

        if (!units) {
          res.status(400).json({ message: "No Units" });
          return;
        }

        const documentCount = await Unit.countDocuments(filter);

        res
          .status(200)
          .json({ units, totalCount: units.length, documentCount });
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
 * @desc    Create New Unit
 * @route   /api/exam/unit
 * @method  POST
 * @access  private(only SuperAdmin) 
 ------------------------------------------------*/
  createUnitCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateUnitCreate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        let unitName = await Unit.findOne({
          unitName: req.body.unitName,
        });
        if (unitName) {
          res.status(400).json({ message: "This Unit Already Exist" });
          return;
        }

        unitName = await Unit.create({
          unitName: req.body.unitName,
          available: req.body.available,
          subject: req.body.subject,
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
 * @desc    Update Unit
 * @route   /api/exam/unit/:id
 * @method  PUT
 * @access  private(only SuperAdmin)
 ------------------------------------------------*/
  updateUnitCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { error } = validateUnitUpdate(req.body);
        if (error) {
          res.status(400).json({ message: error.details[0].message });
          return;
        }

        const unitName = await Unit.findById(req.params.id);
        if (!unitName) {
          res.status(400).json({ message: "No Unit" });
          return;
        }

        await Unit.findByIdAndUpdate(req.params.id, {
          $set: {
            unitName: req.body.unitName,
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
 * @desc    Delete Unit
 * @route   /api/exam/unit/:id
 * @method  DELETE
 * @access  private(only SuperAdmin)
 ------------------------------------------------*/
  deleteUnitCtrl = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const unitName = await Unit.findById(req.params.id);
        if (!unitName) {
          res.status(400).json({ message: "No Unit" });
          return;
        }

        await Unit.findByIdAndDelete(req.params.id);

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

  /**-----------------------------------------------
 * @desc    Generate Qr Code For Units
 * @route   /api/exam/generate-qr-code-units/:id
 * @method  POST
 * @access  private(only admin and superAdmin and sales)
 ------------------------------------------------*/
  generateQrUnits = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const unit = await Unit.findById(req.params.id);
        if (!unit) {
          res
            .status(404)
            .json({ message: "Unit not found or already available." });
          return;
        }

        const qrData = JSON.stringify(unit._id);
        const qrCodeBuffer = await QRCode.toBuffer(qrData, {
          errorCorrectionLevel: "H",
          width: 300,
        });

        // Define the SVG for the centered text with a white background and padding
        const textSvg = `
        <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect x="85" y="125" width="130" height="50" rx="10" fill="white" />
          <text x="150" y="155" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" alignment-baseline="middle" font-weight="bold">
            Universe_o7
          </text>
        </svg>
      `;

        // Composite the QR code with the text SVG
        const finalImageBuffer = await sharp(qrCodeBuffer)
          .composite([
            {
              input: Buffer.from(textSvg),
              top: 0,
              left: 0,
            },
          ])
          .png()
          .toBuffer();

        // Send the final image as a response
        res.writeHead(200, {
          "Content-Type": "image/png",
          "Content-Length": finalImageBuffer.length,
        });
        res.end(finalImageBuffer);
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
 * @route   /api/exam/purchase-units
 * @method  POST
 * @access  private(only student)
 ------------------------------------------------*/
  purchaseUnit = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      const { user } = req as AuthenticatedRequest;

      const student = await Student.findById(user?.id);
      const unit = await Unit.findById(id);

      if (!student || !unit) {
        res.status(404).json({ message: "Student or Unit not found." });
        return;
      }

      if (unit.available) {
        res.status(400).json({
          message: "Unit is already free and does not require purchase.",
        });
        return;
      }

      const isAlreadyPurchased = student.purchasedUnits.some(
        (purchasedUnitId: mongoose.Types.ObjectId) =>
          purchasedUnitId.equals(unit._id as mongoose.Types.ObjectId)
      );

      if (isAlreadyPurchased) {
        res.status(400).json({ message: "Unit already purchased." });
        return;
      }

      await Student.findByIdAndUpdate(
        user?.id,
        {
          $push: { purchasedUnits: unit._id },
        },
        {
          new: true,
        }
      );

      res.status(200).json({ message: "Unit purchased successfully." });
    }
  );
}

export default new UnitController();
