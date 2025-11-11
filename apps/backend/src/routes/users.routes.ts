import { Router } from "express";
import { loginUser, registerUser, editUser, editUserPreference, addUser, updateUser, deleteUser, getRecommendedLocations, googleAuth, getAllUsers } from "../controllers/users.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);

router.patch("/edit", editUser);
router.patch("/edit/preferences", editUserPreference);

router.post("/add", addUser);
router.put("/update/:id", updateUser);
router.delete("/delete", deleteUser);

// router.get("/recommendations/:id", getRecommendedLocations);
router.get("/all", getAllUsers);

export default router;