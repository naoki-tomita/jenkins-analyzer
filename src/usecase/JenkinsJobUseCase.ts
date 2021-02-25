import { binding } from "../../deps.ts";
import { Builds, JobId, Jobs } from "../domain/Job.ts";
import { transactional } from "../driver/Database.ts";
import { JenkinsJobPort } from "../port/JenkinsJobPort.ts";

export class JenkinsJobUseCase {
  @binding
  port!: JenkinsJobPort;

  @transactional
  getJobs(): Promise<Jobs> {
    return this.port.getJobs();
  }

  @transactional
  getBuilds(jobId: JobId): Promise<Builds> {
    return this.port.getBuilds(jobId).then(it => it.sortById());
  }
}
