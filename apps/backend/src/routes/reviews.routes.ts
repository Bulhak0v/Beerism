import { Router } from "express";
import { getLocationReviews, addReview } from "../controllers/reviews.controller.js";

const router = Router();

router.get("/:locationId", getLocationReviews);
router.post("/", addReview);

export default router;