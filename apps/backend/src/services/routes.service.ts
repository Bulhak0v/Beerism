import { db } from "../config/db.js";
import { Route } from "../models/routes.model.js";

export const RoutesService = {
    async getAllRoutesByUserId(user_id: number): Promise<any[]> {
        const query = `
            SELECT 
                r.*, 
                COALESCE(
                    json_agg(
                        json_build_object(
                            'location_id', rs.location_id,
                            'stop_order', rs.stop_order,
                            'notes', rs.notes
                        ) ORDER BY rs.stop_order
                    ) FILTER (WHERE rs.location_id IS NOT NULL), 
                    '[]'
                ) as stops
            FROM routes r
            LEFT JOIN route_stops rs ON r.route_id = rs.route_id
            WHERE r.user_id = $1
            GROUP BY r.route_id;
        `;
        const result = await db.query(query, [user_id]);
        return result.rows;
    },

    async getAllRoutes(): Promise<Route[]> {
        const result = await db.query("SELECT * FROM routes");
        return result.rows;
    },

    async addRoute(user_id: number, name: string, description: string, visibility: string, stops: any[]): Promise<Route> {
        const client = await db.connect();
        
        try {
            await client.query('BEGIN');

            const routeQuery = `
                INSERT INTO routes (user_id, name, description, visibility, created_at)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING *;
            `;
            const routeRes = await client.query(routeQuery, [user_id, name, description, visibility]);
            const newRoute = routeRes.rows[0];

            if (stops && stops.length > 0) {
                for (const stop of stops) {
                    await client.query(
                        `INSERT INTO route_stops (route_id, location_id, stop_order, notes)
                         VALUES ($1, $2, $3, $4)`,
                        [newRoute.route_id, stop.location_id, stop.stop_order, stop.note || ""]
                    );
                }
            }

            await client.query('COMMIT');
            return newRoute;

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    async deleteRoute(route_id: number): Promise<number | null> {
        const query = "DELETE FROM routes WHERE route_id = $1";
        const values = [route_id];
        const result = await db.query(query, values);
        return result.rowCount;
    },

    async updateRoute(route_id: number, name: string, description: string, visibility: string, stops: any[]): Promise<Route> {
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const updated_at = new Date();
            
            const query = `
                UPDATE routes
                SET name = $1, description = $2, visibility = $3, updated_at = $4
                WHERE route_id = $5
                RETURNING *;
            `;
            const result = await client.query(query, [name, description, visibility, updated_at, route_id]);

            if (result.rows.length === 0) {
                throw new Error("Route not found");
            }

            if (stops) {
                await client.query("DELETE FROM route_stops WHERE route_id = $1", [route_id]);

                if (stops.length > 0) {
                    for (const stop of stops) {
                        await client.query(
                            `INSERT INTO route_stops (route_id, location_id, stop_order, notes)
                             VALUES ($1, $2, $3, $4)`,
                            [route_id, stop.location_id, stop.stop_order, stop.note || ""]
                        );
                    }
                }
            }

            await client.query('COMMIT');
            return result.rows[0];

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
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