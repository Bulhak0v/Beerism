import { db } from "../config/db.js";
import { Location } from "../models/locations.model.js";
import { UserService } from "./users.service.js";

const BASE_QUERY = `
    SELECT 
        l.*,
        (
            SELECT COALESCE(json_agg(DISTINCT lat.atmosphere_tag), '[]')
            FROM location_atmosphere_tags lat
            WHERE lat.location_id = l.location_id
        ) AS atmospheres,
        (
            SELECT COALESCE(json_agg(json_build_object('beer_style_id', bs.beer_style_id, 'beer_style_name', bs.beer_style_name)), '[]')
            FROM location_beer_styles lbs
            JOIN beer_styles bs ON lbs.beer_style_id = bs.beer_style_id
            WHERE lbs.location_id = l.location_id
        ) AS beer_styles
    FROM locations l
`;

export const LocationsService = {
    async getAll(): Promise<Location[]> {
        const result = await db.query(`${BASE_QUERY} ORDER BY l.location_id`);
        return result.rows;
    },

    async delete(id: number): Promise<number | null> {
        const query = "DELETE FROM locations WHERE location_id = $1";
        const values = [id];
        const result = await db.query(query, values);
        return result.rowCount;
    },

    async getAtmosphereOptions(): Promise<string[]> {
        const result = await db.query(
            `SELECT unnest(enum_range(NULL::venue_atmosphere)) AS value`
        );
        return result.rows.map(row => row.value);
    },

    async getBudgetOptions(): Promise<string[]> {
        const result = await db.query(
            `SELECT unnest(enum_range(NULL::budget_range)) AS value`
        );
        return result.rows.map(row => row.value);
    },

    async addLocation(name: string, description: string, city: string, address: string, website: string, rating: number, average_budget_requirment: string, opens_at: string, closes_at: string, latitude: number, longtitude: number): Promise<Location> {
        const result = await db.query<Location>(
            `
            INSERT INTO locations (name, description, city, address, website, rating, average_budget_requirment, opens_at, closes_at, latitude, longtitude)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
            `,
            [name, description, city, address, website, rating, average_budget_requirment, opens_at, closes_at, latitude, longtitude]
        );
        return result.rows[0];
    },

    async updateLocation(id: number, name: string, description: string, city: string, address: string, website: string, rating: number, average_budget_requirment: string, opens_at: string, closes_at: string, latitude: number, longtitude: number): Promise<Location> {
        const result = await db.query<Location>(
            `
            UPDATE locations
            SET name = $1, description = $2, city = $3, address = $4, website = $5, rating = $6, average_budget_requirment = $7, opens_at = $8, closes_at = $9, latitude = $10, longtitude = $11
            WHERE location_id = $12
            RETURNING *;
            `,
            [name, description, city, address, website, rating, average_budget_requirment, opens_at, closes_at, latitude, longtitude, id]
        );

        if (result.rows.length === 0) {
            throw new Error("Location not found");
        }
        return result.rows[0];
    },

    async findLocationById(id: number): Promise<Location | null> {
        const result = await db.query<Location>(
            `${BASE_QUERY} WHERE l.location_id = $1`,
            [id]
        );
        return result.rows[0] || null;
    },

    async getAllCities(): Promise<string[]> {
        const result = await db.query(
            "SELECT DISTINCT city FROM locations WHERE city IS NOT NULL;"
        );
        return result.rows.map(item => item.city as string);
    },

    async getAllBeerStyles(): Promise<{ style_id: number; name: string }[]> {
        const result = await db.query("SELECT beer_style_id, name FROM beer_styles ORDER BY name ASC");
        return result.rows;
    },

    async getRecommendedLocations(user_id: number, city: string | undefined): Promise<Location[]> {
        const user = await UserService.getUserById(user_id);
        if (!user) {
            throw new Error("User not found");
        }

        const preferred_budget_range = (user as any).preferred_budget_range;
        const preferred_venue_atmosphere = (user as any).preferred_venue_atmosphere;
        const preferred_beer_style_id = (user as any).preferred_beer_style_id;

        const city_coefficient = 500;
        const budget_coefficient = 80;
        const venue_coefficient = 60;
        const beer_style_coefficient = 20;
        const rating_coefficient = 100;

        const result = await db.query(BASE_QUERY);
        const locations = result.rows;

        const scored = locations.map(loc => {
            let score = 0;

            if (city && loc.city && loc.city.toLowerCase() === city.toLowerCase()) {
                score += 1 * city_coefficient;
            }

            if (preferred_budget_range && loc.average_budget_requirment === preferred_budget_range) score += 1 * budget_coefficient;
            
            if (preferred_venue_atmosphere && loc.atmospheres && loc.atmospheres.includes(preferred_venue_atmosphere)) score += 1 * venue_coefficient;
            
            if (preferred_beer_style_id && loc.beer_styles && loc.beer_styles.some((bs: any) => bs.beer_style_id === preferred_beer_style_id)) score += 1 * beer_style_coefficient;
            
            score += (loc.rating || 0) * rating_coefficient;
            score = Math.round(score);
            return { loc, score };
        });

        scored.sort((a, b) => b.score - a.score);

        return scored.map(s => s.loc);
    }
};