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
        
        if (!user_id || !location_id || !rating) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newReview = await ReviewsService.addReview(user_id, location_id, rating, review_text);

        
        res.status(201).json(newReview);
    } catch (err: any) {
        console.error("Error adding review:", err);
        res.status(500).json({ error: "Failed to add review" });
    }
}