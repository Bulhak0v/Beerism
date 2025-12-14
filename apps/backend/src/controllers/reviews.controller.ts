import { Request, Response } from "express";
import { ReviewsService } from "../services/reviews.service.js";

export async function getLocationReviews(req: Request, res: Response) {
    try {
        const locationId = parseInt(req.params.locationId);
        if (isNaN(locationId)) return res.status(400).json({ error: "Invalid location ID" });

        const reviews = await ReviewsService.getReviewsByLocation(locationId);
        res.json(reviews);
    } catch (err: any) {
        console.error("Error fetching reviews:", err);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
}

export async function addReview(req: Request, res: Response) {
    try {
        const { user_id, location_id, rating, review_text } = req.body;
        const newReview = await ReviewsService.addReview(user_id, location_id, rating, review_text);
        res.status(201).json(newReview);
    } catch (err: any) {
        if (err.message === "Review already exists") {
            return res.status(409).json({ message: "You have already reviewed this location." });
        }
        res.status(500).json({ error: "Add error" });
    }
}

export async function updateReview(req: Request, res: Response) {
    try {
        const { user_id, review_id, rating, review_text } = req.body;
        const updated = await ReviewsService.updateReview(user_id, review_id, rating, review_text);
        res.json(updated);
    } catch (err) { res.status(500).json({ error: "Update error" }); }
}

export async function deleteReview(req: Request, res: Response) {
    try {
        const reviewId = parseInt(req.params.reviewId);
        const { user_id } = req.body; 
        await ReviewsService.deleteReview(user_id, reviewId);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: "Delete error" }); }
}