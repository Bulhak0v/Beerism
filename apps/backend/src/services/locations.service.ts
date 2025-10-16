import { db } from "../config/db.js";
import { Location } from "../models/locations.model.js";

export const LocationsService = {
    async getAll(): Promise<Location[]> {
        const result = await db.query("SELECT * FROM locations");
        return result.rows;
    },

    async delete(id: number): Promise<number | null> {
        const query = "DELETE FROM locations WHERE location_id = $1";
        const values = [id];
        const result = await db.query(query, values);
        return result.rowCount;
    }
};