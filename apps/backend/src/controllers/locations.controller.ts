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

export async function addLocation(req: Request, res: Response) {
    const { name, description, city, adress, website, rating, average_budget_requirment, opens_at, closes_at, latitude, longtitude } = req.body;

    try {
        const newLocation = await LocationsService.addLocation(name, description, city, adress, website, rating, average_budget_requirment, opens_at, closes_at, latitude, longtitude);
        res.status(201).json(newLocation);
    } catch (error: any) {
        console.error("Error occured while creating a location:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateLocation(req: Request, res: Response) {
    const locationId = Number(req.params.id);
    const { name, description, city, adress, website, rating, average_budget_requirment, opens_at, closes_at, latitude, longtitude } = req.body;

    try {
        const updatedLocation = await LocationsService.updateLocation(locationId, name, description, city, adress, website, rating, average_budget_requirment, opens_at, closes_at, latitude, longtitude);
        res.status(201).json(updatedLocation);
    } catch (error: any) {
        console.error("Error occured while updating location:", error);
        if (error.message == "Location not found") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function getLocationById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const locationId = parseInt(id, 10);

    if (isNaN(locationId)) {
      return res.status(400).json({ error: "Invalid ID format." });
    }

    const location = await LocationsService.findLocationById(locationId);

    if (!location) {
      return res.status(404).json({ message: "Location not found." });
    }

    res.status(200).json(location);
  } catch (err: unknown) {
    console.error("Error fetching location by ID:", err);
    res.status(500).json({ error: "An error occurred while fetching the location." });
  }
}

export async function getRecommendedLocations(req: Request, res: Response) {
  try {
    const { user_id, city } = req.query;

    if (!user_id || !city) {
      return res.status(400).json({ message: "Missing user_id or city parameter" });
    }

    const userIdNum = parseInt(user_id as string, 10);
    if (isNaN(userIdNum)) {
      return res.status(400).json({ message: "Invalid user_id format" });
    }

    const recommended = await LocationsService.getRecommendedLocations(userIdNum, city as string);
    res.status(200).json(recommended);
  } catch (error: any) {
    console.error("Error getting recommended locations:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllCities(req: Request, res: Response) {
    try {
        const cities = await LocationsService.getAllCities();
        
        res.status(200).json(cities);

    } catch (error: any) {
        console.error("Error fetching cities:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}