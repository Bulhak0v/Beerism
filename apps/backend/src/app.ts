import express from "express";
import cors from "cors";
import beerStylesRouter from "./routes/beerStyles.routes.js";
import userRouter from "./routes/users.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/beer-styles", beerStylesRouter);
app.use("/api/users", userRouter)

export default app;