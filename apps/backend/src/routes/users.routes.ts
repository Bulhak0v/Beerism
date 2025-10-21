import { Router } from "express";
import { loginUser, registerUser, editUser, editUserPreference } from "../controllers/users.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);


router.patch("/edit", editUser);

router.patch("/edit/preferences", editUserPreference);

export default router;