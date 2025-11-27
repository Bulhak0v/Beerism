import { Router } from "express";
import { getAllRoutes, getAllRoutesByUserId, deleteRoute, addRoute, updateRoute } from "../controllers/routes.controller.js";

const router = Router();

router.get("/", getAllRoutes);
router.get("/:id", getAllRoutesByUserId);
router.delete("/:id", deleteRoute);
router.post("/", addRoute);
router.put("/:id", updateRoute);

export default router;