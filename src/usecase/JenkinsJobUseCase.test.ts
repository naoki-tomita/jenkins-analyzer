import { register } from "../../deps.ts";
import { describe, expect, it, mock } from "../../test_deps.ts";
import { Builds, JobName, Jobs } from "../domain/Job.ts";
import { Database } from "../driver/Database.ts";
import { JenkinsJobPort } from "../port/JenkinsJobPort.ts";
import { JenkinsJobUseCase } from "./JenkinsJobUseCase.ts";

describe("JenkinsJobUseCase", () => {
  describe("#getJobs", () => {
    it("全てのジョブを取得する", async () => {
      const target = new JenkinsJobUseCase();
      const port = mock<JenkinsJobPort>();
      register(port).as(JenkinsJobPort);
      const jobs = mock<Jobs>();
      port.getJobs.mockResolveValueOnce(jobs);
      const db = mock<Database>();
      register(db).as(Database);
      db.transaction.mockImplementation((cb) => cb());

      const actual = await target.getJobs();
      expect(actual).toBe(jobs);
      expect(port.getJobs.mock.calls.length).toBe(1);
    });
  });

  describe("#getBuilds", () => {
    it("指定したジョブの全てのビルドを取得する", async () => {
      const target = new JenkinsJobUseCase();
      const port = mock<JenkinsJobPort>();
      register(port).as(JenkinsJobPort);
      const builds = mock<Builds>();
      builds.sortById.mockReturnValueOnce(builds);
      const jobName = mock<JobName>();
      port.getBuilds.calledWith(jobName).mockResolveValueOnce(builds);
      const db = mock<Database>();
      register(db).as(Database);
      db.transaction.mockImplementation((cb) => cb());

      const actual = await target.getBuilds(jobName);
      expect(actual).toBe(builds);
      expect(builds.sortById.mock.calls.length).toBe(1);
      expect(port.getBuilds.mock.calls[0]).toEqual([jobName]);
    });
  });
});
