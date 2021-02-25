import { Builds, JobId, JobName, Jobs } from "../domain/Job.ts";

export abstract class JenkinsJobPort {
  abstract getJobs(): Promise<Jobs>;
  abstract getBuilds(jobName: JobId): Promise<Builds>;
}
