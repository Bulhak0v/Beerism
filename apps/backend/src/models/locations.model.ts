export interface Location { 
    location_id: number;
    name: string;
    description: string | null;
    city: string | null;
    address: string | null;
    website: string | null;
    rating: number;
    average_budget_requirment: string | null;
    opens_at: string | null;
    closes_at: string | null;
    latitude: number;
    longtitude: number;
    picture: string | null;
}