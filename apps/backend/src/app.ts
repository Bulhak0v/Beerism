import express from "express";
import cors from "cors";
import beerStylesRouter from "./routes/beerStyles.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/beer-styles", beerStylesRouter);

export default app;