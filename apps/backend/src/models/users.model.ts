export interface User {
    user_id: number;
    created_at: Date;
    email: string;
    nickname: string;
    password: string;
    profile_picture: string | null;
    bio: string | null;
    preferred_budget_range: string | null;
    preferred_venue_atmosphere: string | null;
    preferred_beer_style_id: number | null;
}