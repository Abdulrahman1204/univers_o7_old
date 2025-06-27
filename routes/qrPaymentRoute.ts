import express from "express";
import qrPymentController from "../controllers/qrPymentController";
import verifyToken from "../middlewares/verifyToken";
import checkRole from "../middlewares/checkRole";
const router = express.Router();

// Generate QR code for payment
router.get(
  "/generate-qr/:type/:id",
  verifyToken,
  checkRole(["superAdmin", "admin"]),
  qrPymentController.generatePaymentQr
);

// Process payment using QR code
router.post(
  "/process-payment",
  verifyToken,
  checkRole(["student"]),
  qrPymentController.processPayment
);

export default router;
