import { Router } from "express";
import commentController from "../../../controllers/exams_Controllers/comment_Controller/commentController";
import verifyToken from "../../../middlewares/verifyToken";
import checkRole from "../../../middlewares/checkRole";

const router: Router = Router();

// Create Comment and Get
router
  .route("/comment")
  .post(
    verifyToken,
    checkRole(["student"]),
    commentController.createCommentCtrl
  )
  .get(verifyToken, commentController.getCommentCtrl);

// Update Comment and Delete
router
  .route("/comment/:id")
  .put(
    verifyToken,
    checkRole(["student"]),
    commentController.updateCommentCtrt
  )
  .delete(
    verifyToken,
    checkRole(["student", "admin", "superAdmin"]),
    commentController.deleteCommentCtrl
  )

export default router;