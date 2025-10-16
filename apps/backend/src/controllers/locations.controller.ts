import { Request, Response } from "express";
import { LocationsService } from "../services/locations.service.js";

export async function getLocations(req: Request, res: Response) {
    try {
        const data = await LocationsService.getAll();
        res.json(data);
    } catch (err: unknown) {
        res.status(500).json({ error: "An error occurred while fetching locations." });
    }
}

export async function deleteLocation(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const locationId = parseInt(id, 10);
        if (isNaN(locationId)) {
            return res.status(400).json({ error: "Invalid ID format." });
        }
        await LocationsService.delete(locationId);
        res.status(204).send();
    } catch (err: unknown) {
        res.status(500).json({ error: "An error occurred while deleting the location." });
    }
}
