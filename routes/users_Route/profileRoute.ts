import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken";
import profileController from "../../controllers/users_Controllers/profileController";
import checkRole from "../../middlewares/checkRole";

const router: Router = Router();

router
  .route("/users/profile")
  .get(verifyToken, profileController.getProfile)

router
  .route("/users/profile/:id")
  .put(verifyToken, checkRole(["superAdmin", "student"]), profileController.updateProfile);

router
  .route("/users/profile/:id")
  .delete(
    verifyToken,
    checkRole(["superAdmin", "admin"]),
    profileController.deleteProfile
  );

export default router;
