import { gateway } from "./gateway.ts";

export const usecase = {
  async registerJobs() {
    const jobs = await gateway.getJobs();
    console.log(jobs.length);
    for (const job of jobs) {
      if (
        !job.jobPath.value.includes("mink") ||
        job.jobPath.value.includes("mink_register_answers_from_survey") ||
        job.jobPath.value.includes("mink-global-wonks-get-test")
      ) {
        continue;
      }
      const registeredJob = gateway.registerJob(job);
      console.log(registeredJob);
      const builds = await gateway.getBuilds(registeredJob.job.jobPath);
      gateway.registerBuilds(registeredJob, builds);
    }
  },
};
