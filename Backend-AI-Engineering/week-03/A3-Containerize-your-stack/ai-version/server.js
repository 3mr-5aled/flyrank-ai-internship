require("dotenv").config();
const { createApp } = require("./src/app");
const app = createApp();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Example app listening on: http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/docs`);
});
