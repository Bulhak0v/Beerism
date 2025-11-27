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
    }
};