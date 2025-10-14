import { Request, Response } from "express";
import { BeerStyleService } from "../services/beerStyles.service.js";

export async function getBeerStyles(req: Request, res: Response) {
  try {
    const data = await BeerStyleService.getAll();
    res.json(data);
  } catch (err: unknown) {
    res.status(500).json({ error: err});
  }
}

export async function addBeerStyle(req: Request, res: Response) {
  try {
    const { beer_style_name } = req.body;
    const data = await BeerStyleService.add(beer_style_name);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err });
  }
}