import { Request, Response } from "express";
import { QuestsService } from "../services/quests.service.js";

export async function getAllQuests(req: Request, res: Response) {
    try {
        const data = await QuestsService.getAllQuests();
        res.json(data);
    } catch (err: unknown) {
        res.status(500).json({ error: "Error fetching quests" });
    }
}

export async function deleteQuest(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
        
        await QuestsService.deleteQuest(id);
        res.status(204).send();
    } catch (err: unknown) {
        res.status(500).json({ error: "Error deleting quest" });
    }
}

export async function addQuest(req: Request, res: Response) {
    const { title, description, xp_reward, visit_count, validity_start, validity_end, location_ids } = req.body;

    const rewards = { xp: parseInt(xp_reward) || 0 };
    const requirements = { visits: parseInt(visit_count) || 1 };

    try {
        const newQuest = await QuestsService.addQuest(
            title, description, requirements, rewards, validity_start, validity_end, location_ids || []
        );
        res.status(201).json(newQuest);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Error adding quest" });
    }
}

export async function updateQuest(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { title, description, xp_reward, visit_count, validity_start, validity_end, location_ids } = req.body;

    const rewards = { xp: parseInt(xp_reward) || 0 };
    const requirements = { visits: parseInt(visit_count) || 1 };

    try {
        const updated = await QuestsService.updateQuest(
            id, title, description, requirements, rewards, validity_start, validity_end, location_ids || []
        );
        res.status(200).json(updated);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Error updating quest" });
    }
}