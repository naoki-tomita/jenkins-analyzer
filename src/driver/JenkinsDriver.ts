import { binding, DB, named } from "../../deps.ts";
import { Database } from "./Database.ts";

interface Job {
  id: string;
  name: string;
  path: string;
}

interface Build {
  job_id: string;
  build_id: string;
  duration: number;
  status: string;
}

interface Stage {
  job_id: string;
  build_id: string;
  name: string;
  duration: number;
  status: string;
}

@named
export class JenkinsDriver {
  @binding
  database!: Database;

  findAllJobs(): Promise<Job[]> {
    return Promise.resolve(
      this.database.query(`
        SELECT * FROM job;
      `),
    );
  }

  findBuildsBy(jobId: string): Promise<Build[]> {
    return Promise.resolve(this.database.query(
      `SELECT * FROM build WHERE job_id = ?;`,
      [jobId],
    ));
  }

  findStagesBy(jobId: string, buildId: string): Promise<Stage[]> {
    return Promise.resolve(this.database.query(
      `SELECT * FROM stage WHERE job_id = ? AND build_id = ?;`,
      [jobId, buildId],
    ));
  }
}
