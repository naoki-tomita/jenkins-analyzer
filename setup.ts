import { DB } from "./deps.ts";

async function tryCatch(cb: () => Promise<void>) {
  try {
    await cb();
  } catch {}
}

await tryCatch(() => Deno.remove("./data.db"));
const db = new DB("./data.db");
db.query(`
  CREATE TABLE job (
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    PRIMARY KEY(id)
  );
`);

db.query(`
  CREATE TABLE build (
    job_id TEXT NOT NULL,
    build_id TEXT NOT NULL,
    status TEXT NOT NULL,
    duration INT,
    PRIMARY KEY(job_id, build_id)
  );
`);

db.query(`
  CREATE TABLE stage (
    job_id TEXT NOT NULL,
    build_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    duration INT,
    PRIMARY KEY(job_id, build_id, name)
  );
`);

db.close();
