import app from "./app.js";
import { BeerStyleService } from './services/beerStyles.service.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});