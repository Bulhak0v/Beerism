export interface RouteStop {
    route_id: number;
    location_id: number | null;
    stop_order: number;
    notes: string | null;
    meetup_time: Date | null;
}