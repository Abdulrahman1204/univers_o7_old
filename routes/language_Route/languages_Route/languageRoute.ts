import { Router } from "express";
import verifyToken from "../../../middlewares/verifyToken";
import checkRole from "../../../middlewares/checkRole";
import languageController from "../../../controllers/language_Controllers/language_Controller/languageController";

const router: Router = Router()

// Create and Get Language
router.route('/language')
    .post(verifyToken, checkRole(["superAdmin", "admin"]), languageController.createLanguageCtrl)
    .get(verifyToken, languageController.getLanguagesCtrl)

// Update and Delete Language
router.route('/language/:id')
    .put(verifyToken, checkRole(["superAdmin", "admin"]), languageController.updateLanguageCtrl)
    .delete(verifyToken, checkRole(["superAdmin", "admin"]), languageController.deleteLanguageCtrl)

export default router;