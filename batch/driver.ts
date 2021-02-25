import { base64, DB } from "../deps.ts";
import { Configurations } from "./Configurations.ts";

interface JobRow {
  id: string;
  name: string;
  path: string;
}

interface BuildRow {
  job_id: string;
  build_id: string;
  status: string;
  duration: number;
}

interface StageRow {
  job_id: string;
  build_id: string;
  name: string;
  status: string;
  duration: number;
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

const db = {
  _db_: new DB("./data.db"),
  query(sql: string, values: any[]) {
    return [...this._db_.query(sql, values).asObjects()];
  },
  transaction(cb: () => void) {
    this._db_.query("BEGIN;");
    try {
      cb();
      this._db_.query("COMMIT;");
    } catch (e) {
      this._db_.query("ROLLBACK;");
      throw e;
    }
  },
};

export const driver = {
  BasicAuth: base64.fromUint8Array(
    new TextEncoder().encode(
      `${Configurations.username}:${Configurations.password}`,
    ),
  ),
  getBuild(jobName: string, jobId: string) {
    return this.get<JobDescribe>(`${jobName}/${jobId}/wfapi/describe`);
  },
  getJobList(folderName: string) {
    return this.get<{
      jobs: Array<{
        _class: string;
        name: string;
        url: string;
      }>;
    }>(`${folderName}/api/json`);
  },
  async get<T>(path: string, remain: number = 3): Promise<T> {
    console.log(path);
    const response = await fetch(`${Configurations.baseUrl}${path}`, {
      headers: {
        authorization: `Basic ${this.BasicAuth}`,
      },
    });
    if (response.ok) {
      return response.json();
    }
    if (remain === 0) {
      throw Error(await response.text());
    }
    return this.get<T>(path, remain - 1);
  },

  db,
  saveJob({ id, name, path }: JobRow) {
    this.db.transaction(() => {
      this.db.query(
        `INSERT INTO job (id, name, path) VALUES (?, ?, ?);`,
        [id, name, path],
      );
    });
  },
  findJobsByName(name: string) {
    return this.db.query(
      `SELECT * FROM job WHERE name = ?;`,
      [name],
    ) as Array<JobRow>;
  },
  saveBuild({ job_id, build_id, status, duration }: BuildRow) {
    this.db.transaction(() => {
      const builds = this.db.query(
        `SELECT * FROM build WHERE job_id = ? AND build_id = ?;`,
        [job_id, build_id],
      );
      if (builds.length > 0) {
        this.db.query(
          `UPDATE build SET status = ?, duration = ? WHERE job_id = ? AND build_id = ?;`,
          [status, duration, job_id, build_id],
        );
      } else {
        this.db.query(
          `INSERT INTO build (job_id, build_id, status, duration) VALUES (?, ?, ?, ?);`,
          [job_id, build_id, status, duration],
        );
      }
    });
  },
  saveStage({ job_id, build_id, name, status, duration }: StageRow) {
    this.db.transaction(() => {
      const stages = this.db.query(
        `SELECT * FROM stage WHERE job_id = ? AND build_id = ? AND name = ?`,
        [job_id, build_id, name],
      );
      if (stages.length > 0) {
        this.db.query(
          `UPDATE stage SET status = ?, duration = ? WHERE job_id = ? AND build_id = ? AND name = ?;`,
          [job_id, build_id, name, status, duration],
        );
      } else {
        this.db.query(
          `INSERT INTO stage (job_id, build_id, name, status, duration) VALUES (?, ?, ?, ?, ?);`,
          [job_id, build_id, name, status, duration],
        );
      }
    });
  },
};
