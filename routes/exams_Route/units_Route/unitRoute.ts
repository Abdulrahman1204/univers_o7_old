import { Router } from "express";
import verifyToken from "../../../middlewares/verifyToken";
import checkRole from "../../../middlewares/checkRole";
import unitController from "../../../controllers/exams_Controllers/unit_Controller/unitController";

const router: Router = Router();

// Create Unit and Get
router.route('/unit').post(verifyToken, checkRole(["superAdmin", "admin"]), unitController.createUnitCtrl).get(verifyToken, unitController.getUnitCtr)

// Update Unit and Delete
router.route('/unit/:id').put(verifyToken, checkRole(["superAdmin", "admin"]), unitController.updateUnitCtrl).delete(verifyToken, checkRole(["superAdmin"]), unitController.deleteUnitCtrl)

// Generate Code Unit
router.route('/generate-qr-code-units/:id').post(verifyToken, checkRole(["superAdmin", "admin", 'sales']),unitController.generateQrUnits)

// bay Unit
router.route('/purchase-units/:id').post(verifyToken, checkRole(["student"]), unitController.purchaseUnit)

export default router;
