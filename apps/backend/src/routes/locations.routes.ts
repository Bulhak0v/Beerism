import { Router } from "express";
import { getLocations, deleteLocation, addLocation } from "../controllers/locations.controller.js";

const router = Router();

router.get("/", getLocations);
router.delete("/:id", deleteLocation);
router.post("/", addLocation);

export default router;