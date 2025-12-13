import { Router } from "express";
import { 
    getAllQuests, 
    addQuest, 
    updateQuest, 
    deleteQuest 
} from "../controllers/quests.controller.js";

const router = Router();

router.get("/", getAllQuests);

router.post("/", addQuest);

router.put("/:id", updateQuest);

router.delete("/:id", deleteQuest);

export default router;