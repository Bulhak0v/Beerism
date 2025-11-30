import { Router } from "express";
import { getAllRoutes, getAllRoutesByUserId, deleteRoute, addRoute, updateRoute, optimizeRoute } from "../controllers/routes.controller.js";

const router = Router();

router.get("/", getAllRoutes);
router.get("/:id", getAllRoutesByUserId);
router.delete("/:id", deleteRoute);
router.post("/", addRoute);
router.put("/:id", updateRoute);
router.post("/:id", optimizeRoute);

export default router;