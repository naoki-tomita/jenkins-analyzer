import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts";
import { Application } from "https://deno.land/x/abc@v1.2.4/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { update } from "./batch.ts";

const env = config();
const Configurations = {
  baseUrl: env.BASE_URL as string,
  jobName: env.JOB_NAME as string,
  username: env.USERNAME as string,
  password: env.PASSWORD as string,
};

const app = new Application();

app
.get("/list", async (context) => {
  const result = await update();
  context.json(result);
})
.static("/statics", "statics")
.start({ port: 8080 });
