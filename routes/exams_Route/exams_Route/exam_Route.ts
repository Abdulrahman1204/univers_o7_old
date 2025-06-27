import { Router } from "express";
import verifyToken from "../../../middlewares/verifyToken";
import checkRole from "../../../middlewares/checkRole";
import examController from "../../../controllers/exams_Controllers/exam_controller/examController";

const router: Router = Router()

// Create Exam
router.route('/examgenerate').post(verifyToken, examController.generateExamCtrl)

// Get The Exam
router.route('/examgenerate/:id').get(verifyToken, examController.getExamByIdCtrl)

export default router;