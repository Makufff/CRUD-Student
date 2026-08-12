import { Hono } from "hono";
import { renderer } from "./renderer";
import { studentRouter } from "./routes/student.routes";
import type { AppEnv } from "./types/env";
import pageTemplate from "./templates/student-playground.html?raw";

const app = new Hono<AppEnv>();

app.use(renderer);
app.route('/students', studentRouter);

app.get('/', (c) => {
  const today = new Date().toISOString().slice(0, 10);
  return c.html(pageTemplate.replaceAll("__TODAY__", today));
});

export default app;
