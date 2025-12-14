import { db } from "../config/db.js";
import { Review } from "../models/reviews.model.js";

export const ReviewsService = {
    async getReviewsByLocation(locationId: number): Promise<Review[]> {
        const query = `
            SELECT 
                r.*,
                u.nickname,
                u.profile_picture
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.location_id = $1
            ORDER BY r.created_at DESC
        `;
        const result = await db.query(query, [locationId]);
        return result.rows;
    },

    async addReview(userId: number, locationId: number, rating: number, text: string): Promise<Review> {

        const query = `
            INSERT INTO reviews (user_id, location_id, rating, review_text, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *
        `;
        const result = await db.query(query, [userId, locationId, rating, text]);
        
        const newReview = result.rows[0];
        const userRes = await db.query("SELECT nickname, profile_picture FROM users WHERE user_id = $1", [userId]);
        
        return {
            ...newReview,
            nickname: userRes.rows[0]?.nickname,
            profile_picture: userRes.rows[0]?.profile_picture
        };
    }
};