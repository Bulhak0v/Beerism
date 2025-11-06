import app from "./app.js";

console.log(process.env.DATABASE_URL);
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});