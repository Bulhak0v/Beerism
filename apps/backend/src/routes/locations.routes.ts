import { Router } from "express";
import { getLocations, deleteLocation, addLocation, updateLocation, getLocationById, getRecommendedLocations, getAllCities } from "../controllers/locations.controller.js";

const router = Router();

router.get("/", getLocations);
router.delete("/:id", deleteLocation);
router.post("/", addLocation);
router.put("/:id", updateLocation);
router.get("/:id", getLocationById);
router.get("/recommendations/byCity", getRecommendedLocations);
router.get("/:id", getLocationById);
router.get("/cities", getAllCities);

export default router;