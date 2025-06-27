import { Router } from "express";
import subjectController from "../../../controllers/exams_Controllers/subject_Controller/subjectController";
import verifyToken from "../../../middlewares/verifyToken";
import checkRole from "../../../middlewares/checkRole";

const router: Router = Router();

// Create Subject and Get
router
  .route("/subject")
  .post(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    subjectController.createSubjectCtrl
  )
  .get(verifyToken, subjectController.getSubjectCtr);

// Update Subject and Delete
router
  .route("/subject/:id")
  .put(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    subjectController.updateSubjectCtrl
  )
  .delete(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    subjectController.deleteSubjectCtrl
  );

export default router;
