import { Router } from "express";
import verifyToken from "../../../middlewares/verifyToken";
import checkRole from "../../../middlewares/checkRole";
import questionController from "../../../controllers/exams_Controllers/question_Controller/questionController";
import favouriteQ from "../../../controllers/exams_Controllers/favouriteQ";
import { upload } from "../../../utils/cloudinary";

const router: Router = Router();

// Create Question and Get
router
  .route("/question")
  .post(
    verifyToken,
      
    upload.fields([
      { name: "photo", maxCount: 1 },
      { name: "imageQ", maxCount: 1 },
    ]),
    questionController.createQuestionCtrl
  )
  .get(verifyToken, questionController.getQuestionsCtrl);

// Add Favorite
router
  .route("/fav")
  .post(
    verifyToken,
    checkRole(["teacher", "student"]),
    favouriteQ.createFavCtrl
  );

// Update Question and Delete
router
  .route("/question/:id")
  .put(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    questionController.updateQuestionCtrl
  )
  .delete(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    questionController.deleteQuestionCtrl
  );

export default router;
