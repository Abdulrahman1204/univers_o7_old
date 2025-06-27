import { Router } from 'express';
import authController from '../../controllers/users_Controllers/authController';
import { upload } from '../../utils/cloudinary';
import verifyToken from "../../middlewares/verifyToken";
import checkRole from "../../middlewares/checkRole";

const router: Router = Router();

// Mobile
router.route('/register').post(upload.single("profilePhoto"), authController.registerUserCtrl);
router.route('/login').post(authController.loginUserCtrl)

// Dashboard
router.route('/dashadmin/register').post(verifyToken, checkRole(["superAdmin", "admin"]), authController.registerDashCtrl);
router.route('/dashadmin/login').post(authController.loginDashCtrl);

// Teacher
router.route('/teacher/register').post(verifyToken, checkRole(["superAdmin", "admin"]), authController.registerTeacherDashCtrl);

// Logout
router.route('/logout').get(verifyToken, authController.logoutCtrl);

export default router;