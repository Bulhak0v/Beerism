import { Router } from "express";
import { getLocationReviews, addReview, updateReview, deleteReview } from "../controllers/reviews.controller.js";

const router = Router();

router.get("/:locationId", getLocationReviews);
router.post("/", addReview);
router.put("/", updateReview);
router.delete("/:reviewId", deleteReview);


export default router;