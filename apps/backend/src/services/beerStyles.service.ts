import { db } from "../config/db.js";
import { BeerStyle } from "../models/beerStyles.model.js";

export const BeerStyleService = {
  async getAll(): Promise<BeerStyle[]> {
    const result = await db.query("SELECT * FROM beer_styles ORDER BY beer_style_id");
    return result.rows;
  },

  async add(name: string): Promise<BeerStyle> {
    const result = await db.query(
      "INSERT INTO beer_styles (beer_style_name) VALUES ($1) RETURNING *",
      [name]
    );
    return result.rows[0];
  }
};
