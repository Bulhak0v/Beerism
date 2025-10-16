import { Router } from "express";
import { getLocations, deleteLocation } from "../controllers/locations.controller.js";

const router = Router();

router.get("/", getLocations);
router.delete("/:id", deleteLocation);

export default router;