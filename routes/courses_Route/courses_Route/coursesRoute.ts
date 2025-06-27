import { Router } from "express";
import verifyToken from "../../../middlewares/verifyToken";
import checkRole from "../../../middlewares/checkRole";
import courseController from "../../../controllers/courses_Controllers/course_Controller/courseController";

const router: Router = Router();

// Create Course and Get
router
  .route("/course")
  .post(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    courseController.createCourseCtrl
  )
  .get(verifyToken, courseController.getCoursesCtrl);

// Delete Course
router
  .route("/course/:id")
  .delete(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    courseController.deleteCourseCtrl
  )
  .put(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    courseController.updateCourseCtrl
  );

export default router;
