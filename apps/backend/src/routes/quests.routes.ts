import { Router } from "express";
import { 
    getAllQuests, 
    addQuest, 
    updateQuest, 
    deleteQuest,
    getAvailableQuests
} from "../controllers/quests.controller.js";

const router = Router();

router.get("/", getAllQuests);

router.post("/", addQuest);

router.put("/:id", updateQuest);

router.delete("/:id", deleteQuest);

router.get("/available/:userId", getAvailableQuests);

export default router;