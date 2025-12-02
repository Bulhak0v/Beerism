import { RouteStop } from "./routeStops.model.ts";

export interface Route {
    route_id: number;
    user_id: number;
    name: string;
    description: string | null;
    visibility: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    stops?: RouteStop[];
}