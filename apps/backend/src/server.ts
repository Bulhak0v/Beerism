import app from "./app.js";
import { LocationsService } from "./services/locations.service.js";

console.log(process.env.DATABASE_URL);
const PORT = process.env.PORT || 4000;

const list = LocationsService.getAll();
console.log(list);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});