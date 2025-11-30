import { db } from "../config/db.js";
import { Route } from "../models/routes.model.js";
import { RouteStop } from "../models/routeStops.model.js";

export const RoutesService = {
    async getAllRoutes(): Promise<Route[]> {
        const result = await db.query("SELECT * FROM routes")
        return result.rows;
    },

    async getAllRoutesByUserId(user_id: number): Promise<Route[]> {
        const query = "SELECT * FROM routes WHERE user_id = $1";
        const values = [user_id];
        const result = await db.query(query, values);
        return result.rows;
    },

    async deleteRoute(route_id: number): Promise<number | null> {
        const query = "DELETE FROM routes WHERE route_id = $1";
        const values = [route_id];
        const result = await db.query(query, values);
        return result.rowCount;
    },

    async addRoute(user_id: number, name: string, description: string, visibility: string): Promise<Route> {
        const query = 
        `
        INSERT INTO routes (user_id, name, description, visibility)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `;
        const values = [user_id, name, description, visibility];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    async updateRoute(route_id: number, name: string, description: string, visibility: string): Promise<Route> {
        let updated_at = Date.now()
        const query = 
        `
        UPDATE routes
        SET name = $1, description = $2, visibility = $3, updated_at = $4
        WHERE route_id = $5
        RETURNING *;
        `;
        const values = [name, description, visibility, updated_at, route_id];
        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            throw new Error("Route not found");
        }

        return result.rows[0];
    },

    async optimizeRouteStops(routeId: number, userLat: number, userLng: number): Promise<void> {
        try {
            await db.query('BEGIN');

            const res = await db.query(
                `SELECT rs.*, l.latitude, l.longtitude 
                 FROM route_stops rs
                 JOIN locations l ON rs.location_id = l.location_id
                 WHERE rs.route_id = $1`,
                [routeId]
            );

            const stops = [...res.rows];

            if (stops.length === 0) {
                await db.query('ROLLBACK');
                return;
            }

            let currentLat = userLat;
            let currentLng = userLng;
            const sortedStops: any[] = [];

            while (stops.length > 0) {
                let nearestIndex = -1;
                let minDistance = Infinity;

                for (let i = 0; i < stops.length; i++) {
                    const dist = Math.sqrt(
                        Math.pow(stops[i].latitude - currentLat, 2) +
                        Math.pow(stops[i].longtitude - currentLng, 2)
                    );
                    if (dist < minDistance) {
                        minDistance = dist;
                        nearestIndex = i;
                    }
                }

                const nearestStop = stops[nearestIndex];
                sortedStops.push(nearestStop);
                currentLat = nearestStop.latitude;
                currentLng = nearestStop.longtitude;
                stops.splice(nearestIndex, 1);
            }

            for (let i = 0; i < sortedStops.length; i++) {
                const stop = sortedStops[i];
                await db.query(
                    `UPDATE route_stops SET stop_order = $1 WHERE route_id = $2 AND location_id = $3`,
                    [i + 1, routeId, stop.location_id]
                );
            }

            await db.query('COMMIT');

        } catch (e) {
            await db.query('ROLLBACK');
            throw e;
        }
    }
};