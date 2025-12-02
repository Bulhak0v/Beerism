import express from "express";
import cors from "cors";
import beerStylesRouter from "./routes/beerStyles.routes.js";
import locationsRouter from "./routes/locations.routes.js";
import userRouter from "./routes/users.routes.js";
import routesRouter from "./routes/routes.routes.js";
import routeStopsRouter from "./routes/routeStops.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/beer-styles", beerStylesRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/users", userRouter)
app.use("/api/routes", routesRouter);
app.use("/api/route-stops", routeStopsRouter);

export default app;