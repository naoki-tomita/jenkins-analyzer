import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts";
import PromisePool from "https://unpkg.com/native-promise-pool@^3.16.0/edition-deno/index.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const env = config();
const Configurations = {
  baseUrl: env.BASE_URL as string,
  jobName: env.JOB_NAME as string,
  username: env.USERNAME as string,
  password: env.PASSWORD as string,
};

const BasicAuth = base64.fromUint8Array(new TextEncoder().encode(`${Configurations.username}:${Configurations.password}`));
function get<T>(path: string): Promise<T> {
  console.log(path);
  return fetch(`${Configurations.baseUrl}/${Configurations.jobName}/${path}`, {
    headers: {
      authorization: `Basic ${BasicAuth}`,
    },
  }).then((it) => it.json());
}

type JobStatus = "FAILED" | "SUCCESS";

interface JobDescribe {
  id: string;
  name: string;
  status: JobStatus;
  startTimeMillis: number;
  endTimeMillis: number;
  durationMillis: number;
  queueDurationMillis: number;
  pauseDurationMillis: number;
  stages: Array<{
    id: string;
    name: string;
    execNode: string;
    status: JobStatus;
    startTimeMillis: number;
    durationMillis: number;
    pauseDurationMillis: number;
  }>;
}

export async function update() {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const json = JSON.parse(await Deno.readFile("./statics/jobs.json").then(it => decoder.decode(it)).catch(() => "[]"));
  const oldLastJobId = parseInt(json[json.length - 1]?.id ?? "0", 10);
  const lastJob = await get<JobDescribe>("lastBuild/wfapi/describe");
  const lastJobId = parseInt(lastJob.id, 10);
  const pool = new PromisePool(100);
  const jobs = await Promise.all(
    Array(lastJobId - oldLastJobId).fill(null).map((_, i) =>
      pool.open(() => get<JobDescribe>(`${oldLastJobId + i + 1}/wfapi/describe`))
    )
  );
  console.log("Fetch completed. Caching file...")
  await Deno.writeFile("./statics/jobs.json", encoder.encode(JSON.stringify([...json, ...jobs])));
  return [...json, ...jobs];
}
