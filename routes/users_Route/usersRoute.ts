import { Router } from 'express';
import usersController from '../../controllers/users_Controllers/usersController';
import verifyToken from '../../middlewares/verifyToken';
import checkRole from '../../middlewares/checkRole';
import examController from '../../controllers/exams_Controllers/exam_controller/examController';

const router: Router = Router();

// Get All Users
router.route('/users/dash').get(verifyToken, checkRole(['superAdmin']), usersController.getUsersCtrl)

// Get All Teachers
router.route('/teachers/dash').get(verifyToken, checkRole(['superAdmin', "admin", "student"]), usersController.getTeachersCtrl)

// Get All Students
router.route('/students/dash').get(verifyToken, checkRole(['superAdmin', "admin", "student"]), usersController.getStudentsCtrl)

// Add Exam To
router.route('/student/exam_student').put(verifyToken, checkRole(["student"]), examController.addExamToStudent)

export default router;