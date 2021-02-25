import { PromisePool, v4 } from "../deps.ts";
import {
  Build,
  BuildNumber,
  Builds,
  Duration,
  Job,
  JobPath,
  Jobs,
  JobWithId,
  Stage,
  StageName,
  Stages,
  Status,
  UUID,
} from "./domain.ts";
import { driver } from "./driver.ts";

export const gateway = {
  async getJobs(parentJob: string = ""): Promise<Jobs> {
    const { jobs } = await driver.getJobList(parentJob);
    const nestedJobs = jobs.map((job) => {
      if (job._class.includes("Folder")) {
        // folder
        return this.getJobs(`${parentJob}/job/${job.name}`).then((it) =>
          it.values
        );
      } else if (
        job._class.includes("WorkflowJob") ||
        job._class.includes("FreeStyleProject")
      ) {
        // job
        return Promise.resolve([
          new Job(new JobPath(`${parentJob}/job/${job.name}`)),
        ]);
      }
      return Promise.resolve([]);
    });
    return Promise.all(nestedJobs)
      .then((it) => it.flat())
      .then((it) => new Jobs(it));
  },

  async getBuilds(jobPath: JobPath): Promise<Builds> {
    const lastJob = await driver.getBuild(jobPath.value, `lastBuild`);
    const lastJobId = parseInt(lastJob.id, 10);
    const pool = new PromisePool(10);
    const builds = await Promise.all(
      Array(lastJobId).fill(null).map((_, i) =>
        pool.open(() => driver.getBuild(jobPath.value, `${i + 1}`))
      ),
    );

    return new Builds(
      builds.map((b) =>
        new Build(
          new BuildNumber(b.id),
          new Status(b.status),
          new Duration(b.durationMillis),
          new Stages(
            b.stages.map((s) =>
              new Stage(
                new StageName(s.name),
                new Status(s.status),
                new Duration(s.durationMillis),
              )
            ),
          ),
        )
      ),
    );
  },

  registerJob(job: Job): JobWithId {
    const registeredJobs = driver.findJobsByName(job.jobPath.normalize());
    if (registeredJobs.length > 0) {
      return new JobWithId(new UUID(registeredJobs[0].id), job);
    }
    driver.saveJob({
      id: v4.generate(),
      name: job.jobPath.normalize(),
      path: job.jobPath.value,
    });
    const registeredJobs2 = driver.findJobsByName(job.jobPath.normalize());
    return new JobWithId(new UUID(registeredJobs2[0].id), job);
  },

  registerBuilds(job: JobWithId, builds: Builds): Builds {
    builds.forEach((build) => {
      driver.saveBuild({
        job_id: job.id.value,
        build_id: build.buildNumber.value,
        duration: build.duration.value,
        status: build.status.value,
      });
      build.stages.forEach((stage) => {
        driver.saveStage({
          job_id: job.id.value,
          build_id: build.buildNumber.value,
          name: stage.name.value,
          duration: stage.duration.value,
          status: stage.status.value,
        });
      });
    });
    return builds;
  },
};
