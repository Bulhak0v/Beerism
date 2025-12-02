import { Request, Response } from "express";
import { RouteStopsService } from "../services/routeStops.service.js";

export async function addRouteStop(req: Request, res: Response) {
    try {
        const { route_id, location_id, stop_order, notes, meetup_time } = req.body;
        const newStop = await RouteStopsService.addRouteStop(
            route_id, 
            location_id, 
            stop_order, 
            notes, 
            meetup_time || null
        );
        res.status(201).json(newStop);
    } catch (err: any) {
        console.error("Error adding stop:", err);
        res.status(500).json({ error: "Failed to add route stop" });
    }
}

export async function updateRouteStop(req: Request, res: Response) {
    try {
        const { route_id, original_stop_order, location_id, new_stop_order, notes, meetup_time } = req.body;
        
        const updatedStop = await RouteStopsService.updateRouteStop(
            route_id,
            original_stop_order,
            location_id,
            new_stop_order,
            notes,
            meetup_time
        );
        res.status(200).json(updatedStop);
    } catch (err: any) {
        console.error("Error updating stop:", err);
        res.status(500).json({ error: "Failed to update route stop" });
    }
}

export async function deleteRouteStop(req: Request, res: Response) {
    try {
        const { route_id, stop_order } = req.params;
        const rId = parseInt(route_id);
        const sOrder = parseInt(stop_order);

        await RouteStopsService.deleteRouteStop(rId, sOrder);
        res.status(204).send();
    } catch (err: any) {
        console.error("Error deleting stop:", err);
        res.status(500).json({ error: "Failed to delete route stop" });
    }
}