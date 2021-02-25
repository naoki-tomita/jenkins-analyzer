import { binding, namedWith } from "../../deps.ts";
import {
  Build,
  BuildId,
  Builds,
  Duration,
  Job,
  JobId,
  JobName,
  Jobs,
  Stage,
  StageName,
  Stages,
  Status,
} from "../domain/Job.ts";
import { JenkinsDriver } from "../driver/JenkinsDriver.ts";
import { JenkinsJobPort } from "../port/JenkinsJobPort.ts";
import { TODO } from "../TODO.ts";

@namedWith(JenkinsJobPort)
export class JenkinsJobGateway implements JenkinsJobPort {
  @binding
  driver!: JenkinsDriver;

  async getJobs(): Promise<Jobs> {
    const jobs = await this.driver.findAllJobs().then((list) =>
      list.map((it) => new Job(new JobId(it.id), new JobName(it.name)))
    );
    return new Jobs(jobs);
  }

  async getBuilds(jobId: JobId): Promise<Builds> {
    const builds = await this.driver.findBuildsBy(jobId.value);
    return new Builds(
      await Promise.all(
        builds.map(async (build) =>
          new Build(
            new BuildId(build.build_id),
            new Duration(build.duration),
            new Status(build.status),
            new Stages(
              await this.driver.findStagesBy(jobId.value, build.build_id).then(
                (stages) =>
                  stages.map((stage) =>
                    new Stage(
                      new StageName(stage.name),
                      new Duration(stage.duration),
                      new Status(stage.status),
                    )
                  ),
              ),
            ),
          )
        ),
      ),
    );
  }
}
