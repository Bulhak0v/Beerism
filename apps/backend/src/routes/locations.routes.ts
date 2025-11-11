import { Router } from "express";
import { getLocations, deleteLocation, addLocation, updateLocation, getLocationById, getRecommendedLocations, getAllCities } from "../controllers/locations.controller.js";

const router = Router();

router.get("/", getLocations);
router.delete("/:id", deleteLocation);
router.post("/", addLocation);
router.put("/:id", updateLocation);
router.get("/recommendations/byCity", getRecommendedLocations);
router.get("/cities", getAllCities);
router.get("/:id", getLocationById);

export default router;