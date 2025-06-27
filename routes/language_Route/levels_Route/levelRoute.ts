import { Router } from "express";
import verifyToken from "../../../middlewares/verifyToken";
import checkRole from "../../../middlewares/checkRole";
import levelController from "../../../controllers/language_Controllers/level_Controller/levelController";

const router: Router = Router();

// Create and Get Level
router
  .route("/level")
  .post(verifyToken, checkRole(["superAdmin", "admin"]), levelController.createLevelCtrl)
  .get(verifyToken, levelController.getLevelCtrl);

// Update and Delete Level
router
  .route("/level/:id")
  .put(verifyToken, checkRole(["superAdmin", "admin"]), levelController.updateLevelCtrl)
  .delete(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    levelController.deleteLevelCtrl
  );
export default router;