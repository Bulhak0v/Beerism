import { db } from "../config/db.js";
import { RouteStop } from "../models/routeStops.model.js";

export const RouteStopsService = {
    async getAllRouteStops(): Promise<RouteStop[]> {
        const result = await db.query("SELECT * FROM route_stops")
        return result.rows;
    },

    async getAllRouteStopsByRouteId(route_id: number): Promise<RouteStop[]> {
        const query = "SELECT * FROM route_stops WHERE route_id = $1";
        const values = [route_id];
        const result = await db.query(query, values);
        return result.rows;
    },

    async getAllRouteStopsByLocationId(location_id: number): Promise<RouteStop[]> {
        const query = "SELECT * FROM route_stops WHERE location_id = $1";
        const values = [location_id];
        const result = await db.query(query, values);
        return result.rows;
    },

    async addRouteStop(route_id: number, location_id: number, stop_order: number, notes: string, meetup_time: Date): Promise<RouteStop> {
        const query = 
        `
        INSERT INTO route_stops (route_id, location_id, stop_order, notes, meetup_time)
        VALUES ($1, $2, $3, $4, 5)
        RETURNING *;
        `;
        const values = [route_id, location_id, stop_order, notes, meetup_time];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    async updateRouteStop(route_id: number, original_stop_order: number, location_id: number, new_stop_order: number, notes: string, meetup_time: Date): Promise<RouteStop> {
        const query = 
        `
        UPDATE route_stops
        SET location_id = $1, stop_order = $2, notes = $3, meetup_time = $4
        WHERE route_id = $5 AND stop_order = $6
        RETURNING *;
        `;
        const values = [location_id, new_stop_order, notes, meetup_time, route_id, original_stop_order];
        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            throw new Error("Route stop not found");
        }

        return result.rows[0];
    },

    async deleteRouteStop(route_id: number, stop_order: number): Promise<number | null> {
        const query = "DELETE FROM route_stops WHERE route_id = $1 AND stop_order = $2";
        const values = [route_id, stop_order];
        const result = await db.query(query, values);
        return result.rowCount;
    },
};