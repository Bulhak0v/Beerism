import { Request, Response } from "express";
import { RoutesService } from "../services/routes.service.js";
import { error } from "console";

export async function getAllRoutes(req: Request, res: Response) {
    try {
        const data = await RoutesService.getAllRoutes();
        res.json(data);
    } catch (err: unknown) {
        res.status(500).json({ error: "An error occured while fetching routes" });
    }
}

export async function getAllRoutesByUserId(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const user_id = parseInt(id, 10);
        if (isNaN(user_id)) {
            return res.status(400).json({ error: "Invalid ID format." });
        } 
        const data = await RoutesService.getAllRoutesByUserId(user_id);
        res.json(data);
    } catch (err: unknown) {
        res.status(500).json({ error: "An error occured while fetching routes by user id" });
    }
}

export async function deleteRoute(req: Request, res: Response ) {
    try {
        const { id } = req.params;
        const route_id = parseInt(id, 10);
        if (isNaN(route_id)) {
            return res.status(400).json({ error: "Invalid ID format." });
        }
        await RoutesService.deleteRoute(route_id);
        res.status(204).send();
    } catch (err: unknown) {
        res.status(500).json({ error: "An error occured while deleting a route" });
    }
}

export async function addRoute(req: Request, res: Response ) {
    const {user_id, name, description, visibility} = req.body;

    try {
        const newRoute = await RoutesService.addRoute(user_id, name, description, visibility);
        res.status(201).json(newRoute);
    } catch (err: unknown) {
        res.status(500).json({ error: "An error occured while creating a location" });
    }
}

export async function updateRoute(req: Request, res: Response ) {
    const {name, description, visibility} = req.body;

    try {
        const { id } = req.params;
        const route_id = parseInt(id, 10);
        if (isNaN(route_id)) {
            return res.status(400).json({ error: "Invalid Route ID format." });
        }
        const updatedRoute = await RoutesService.updateRoute(route_id, name, description, visibility);
        res.status(201).json(updatedRoute);
    } catch (err: unknown) {
        res.status(500).json({ error: "An error occured while updating a location" });
    }
}

export async function optimizeRoute(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const routeId = parseInt(id, 10);
        
        const { userLat, userLng } = req.body; 

        if (isNaN(routeId)) {
            return res.status(400).json({ error: "Invalid Route ID" });
        }
        
        if (!userLat || !userLng) {
            return res.status(400).json({ error: "User location (lat, lng) is required for optimization" });
        }

        await RoutesService.optimizeRouteStops(routeId, userLat, userLng);

        res.status(200).json({ message: "Route optimized successfully" });

    } catch (err) {
        console.error("Optimization error:", err);
        res.status(500).json({ error: "Failed to optimize route" });
    }
}