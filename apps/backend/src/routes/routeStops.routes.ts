import { Router } from "express";
import { addRouteStop, updateRouteStop, deleteRouteStop } from "../controllers/routeStops.controller.js";

const router = Router();

router.post("/", addRouteStop);
router.put("/", updateRouteStop);
router.delete("/:route_id/:stop_order", deleteRouteStop);

export default router;