import { Router } from "express";
import { addBeerStyle, getBeerStyles } from "../controllers/beerStyles.controller.js";

const router = Router();

router.get("/", getBeerStyles);
router.post("/", addBeerStyle);

export default router;