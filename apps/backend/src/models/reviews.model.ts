export interface Review {
    review_id: number;
    user_id: number;
    location_id: number;
    rating: number;
    review_text: string;
    created_at: Date;
    updated_at: Date;
    nickname?: string;
    profile_picture?: string;
}