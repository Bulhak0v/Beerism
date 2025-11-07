import { Router } from "express";
import { loginUser, registerUser, editUser, editUserPreference, addUser, updateUser, deleteUser} from "../controllers/users.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.patch("/edit", editUser);
router.patch("/edit/preferences", editUserPreference);

router.post("/add", addUser);
router.put("/update", updateUser);
router.delete("/delete", deleteUser);

export default router;