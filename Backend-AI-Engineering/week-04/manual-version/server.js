require("dotenv").config();
const { createApp } = require("./src/app");
const app = createApp();
const port = 3000;

// Check if Supabase is connected
const connectedToSupabase = async () => {
  try {
    if (!app.supabase) return false;
    const { error } = await app.supabase.auth.getSession();
    if (error) {
      console.error("Error connecting to Supabase:", error.message || error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error connecting to Supabase:", error.message || error);
    return false;
  }
};

app.listen(port, async () => {
  if (process.env.NODE_ENV === "development") {
    console.log(`Development mode enabled`);
  }
  console.log(`Example app listening on: http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/docs`);
  if (await connectedToSupabase()) {
    console.log(`Supabase connected`);
  }
});
