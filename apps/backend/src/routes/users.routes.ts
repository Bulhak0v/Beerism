import { Router } from "express";
import { loginUser, registerUser, editUser, editUserPreference, addUser, updateUser, deleteUser, getRecommendedLocations, googleAuth, getAllUsers, getUserQuests, acceptUserQuest, abandonUserQuest, checkRouteProgress, getLeaderboard, comparePasswords } from "../controllers/users.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);

router.patch("/edit", editUser);
router.patch("/edit/preferences", editUserPreference);

router.post("/add", addUser);
router.put("/update/:id", updateUser);
router.delete("/:id", deleteUser);

router.post("/comparePassword", comparePasswords);

// router.get("/recommendations/:id", getRecommendedLocations);
router.get("/all", getAllUsers);

router.get("/:id/quests", getUserQuests);

router.post("/:id/quests/:questId", acceptUserQuest);
router.delete("/:id/quests/:questId", abandonUserQuest);

router.post("/:id/check-route-progress", checkRouteProgress);

router.get("/leaderboard", getLeaderboard);

export default router;