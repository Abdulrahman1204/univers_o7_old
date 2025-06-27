import { Router } from "express";
import classController from "../../../controllers/exams_Controllers/class_Controller/classController";
import verifyToken from "../../../middlewares/verifyToken";
import checkRole from "../../../middlewares/checkRole";

const router: Router = Router();

// Create Class
router
  .route("/class")
  .post(verifyToken, checkRole(["superAdmin", "admin"]), classController.createClassCtrl)
  .get(verifyToken, classController.getClassesCtr);

// Update Class
router
  .route("/class/:id")
  .put(verifyToken, checkRole(["superAdmin", "admin"]), classController.updateClassCtrl)
  .delete(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    classController.deleteClassCtrl
  );

export default router;
