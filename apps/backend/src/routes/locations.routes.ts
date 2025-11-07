import { Router } from "express";
import { getLocations, deleteLocation, addLocation, updateLocation } from "../controllers/locations.controller.js";

const router = Router();

router.get("/", getLocations);
router.delete("/:id", deleteLocation);
router.post("/", addLocation);
router.put("/:id", updateLocation)

export default router;