import { Router } from "express";
import verifyToken from "../../../middlewares/verifyToken";
import checkRole from "../../../middlewares/checkRole";
import listenQuestionController from "../../../controllers/language_Controllers/questions_Controller/listenQuestionController";
import meanQuestionController from "../../../controllers/language_Controllers/questions_Controller/meanQuestionController";
import emptyQuestionController from "../../../controllers/language_Controllers/questions_Controller/emptyQuestionController";
import rtController from "../../../controllers/language_Controllers/questions_Controller/read&TalkQuestionController";
import rQuestionController from "../../../controllers/language_Controllers/questions_Controller/rankingQuestionController";
const router: Router = Router();

// Create and Get Listen
router
  .route("/listen")
  .post(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    listenQuestionController.createNewQuestoinList
  )
  .get(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    listenQuestionController.getListenQuesiton
  );

// Create and Get  Ranking
router
  .route("/ranking")
  .post(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    rQuestionController.createNewQuestion
  )
  .get(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    rQuestionController.getRQuestions
  );

  // Create and Get Ranking Read & Talk
router
.route("/readatalk")
.post(
  verifyToken,
  checkRole(["superAdmin", "admin"]),
  rtController.createNewQuestion
)
.get(
  verifyToken,
  checkRole(["superAdmin", "admin"]),
  rtController.getRTQuestions
);

// Create and Get Mean
router
  .route("/mean")
  .post(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    meanQuestionController.createNewQuestion
  )
  .get(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    meanQuestionController.getMeanQuestions
  );

// Create and Get Empty
router
  .route("/empty")
  .post(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    emptyQuestionController.createNewQuestion
  )
  .get(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    emptyQuestionController.getEmptyQuestions
  );

// Update and Delete Listen
router
  .route("/listen/:id")
  .put(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    listenQuestionController.updateListenQuestion
  )
  .delete(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    listenQuestionController.deleteListenQieston
  );

// Update and Delete Mean
router
  .route("/mean/:id")
  .put(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    meanQuestionController.updateMeanQuestion
  )
  .delete(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    meanQuestionController.deleteMeanQuestion
  );

// Update and Delete Read & Talk
router
  .route("/readatalk/:id")
  .put(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    rtController.updateRTQuestion
  )
  .delete(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    rtController.deleteRTQuestion
  );

  // Update and Delete Ranking
router
.route("/ranking/:id")
.put(
  verifyToken,
  checkRole(["superAdmin", "admin"]),
  rQuestionController.updateRQuestion
)
.delete(
  verifyToken,
  checkRole(["superAdmin", "admin"]),
  rQuestionController.deleteRQuestion
);

// Update and Delete Empty
router
  .route("/empty/:id")
  .put(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    emptyQuestionController.updateEmptyQuestion
  )
  .delete(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    emptyQuestionController.deleteEmptyQuestion
  );
export default router;
