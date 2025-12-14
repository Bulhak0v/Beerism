import { db } from "../config/db.js";
import { Review } from "../models/reviews.model.js";

export const ReviewsService = {
    async getReviewsByLocation(locationId: number): Promise<Review[]> {
        const query = `
            SELECT r.*, u.nickname, u.profile_picture
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.location_id = $1
            ORDER BY r.created_at DESC
        `;
        const result = await db.query(query, [locationId]);
        return result.rows;
    },

    async addReview(userId: number, locationId: number, rating: number, text: string): Promise<Review> {
        const check = await db.query("SELECT * FROM reviews WHERE user_id = $1 AND location_id = $2", [userId, locationId]);
        if (check.rows.length > 0) {
            throw new Error("Review already exists");
        }

        const query = `
            INSERT INTO reviews (user_id, location_id, rating, review_text, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *
        `;
        const result = await db.query(query, [userId, locationId, rating, text]);
        
        const userRes = await db.query("SELECT nickname, profile_picture FROM users WHERE user_id = $1", [userId]);
        return { ...result.rows[0], ...userRes.rows[0] };
    },

    async updateReview(userId: number, reviewId: number, rating: number, text: string): Promise<Review> {
        const query = `
            UPDATE reviews 
            SET rating = $1, review_text = $2, updated_at = NOW()
            WHERE review_id = $3 AND user_id = $4
            RETURNING * includes location_id
        `;
        
        const result = await db.query(query, [rating, text, reviewId, userId]);
        if (result.rows.length === 0) throw new Error("Review not found or unauthorized");
        
        const userRes = await db.query("SELECT nickname, profile_picture FROM users WHERE user_id = $1", [userId]);
        return { ...result.rows[0], ...userRes.rows[0] };
    },

    async deleteReview(userId: number, reviewId: number): Promise<void> {
        const result = await db.query("DELETE FROM reviews WHERE review_id = $1 AND user_id = $2", [reviewId, userId]);
        if (result.rowCount === 0) throw new Error("Review not found or unauthorized");
    }
};