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
import { describe, expect, it, mock } from "../../test_deps.ts";
import { JenkinsJobGateway } from "./JenkinsJobGateway.ts";
import { register } from "../../deps.ts";
import { JenkinsDriver } from "../driver/JenkinsDriver.ts";

describe("JenkinsJobGateway", () => {
  describe("#getJobs", () => {
    it("ジョブの一覧を取得する", async () => {
      const target = new JenkinsJobGateway();
      const driver = mock<JenkinsDriver>();
      register(driver).as(JenkinsDriver);

      const expected = new Jobs([
        new Job(new JobId("aaaaa"), new JobName("jobname1")),
        new Job(new JobId("bbbbb"), new JobName("jobname2")),
        new Job(new JobId("ccccc"), new JobName("jobname3")),
      ]);
      driver.findAllJobs.mockResolveValueOnce([
        { id: "aaaaa", name: "jobname1", path: "/job/jobname1" },
        { id: "bbbbb", name: "jobname2", path: "/job/jobname2" },
        { id: "ccccc", name: "jobname3", path: "/job/jobname3" },
      ]);

      const actual = await target.getJobs();
      expect(actual).toEqual(expected);
    });
  });

  describe("#getBuilds", () => {
    it("ビルド一覧を取得する", async () => {
      const target = new JenkinsJobGateway();
      const driver = mock<JenkinsDriver>();
      register(driver).as(JenkinsDriver);

      const expected = new Builds([
        new Build(
          new BuildId("1"),
          new Duration(250),
          new Status("SUCCESS"),
          new Stages([
            new Stage(
              new StageName("stage1"),
              new Duration(100),
              new Status("SUCCESS"),
            ),
            new Stage(
              new StageName("stage2"),
              new Duration(80),
              new Status("SUCCESS"),
            ),
            new Stage(
              new StageName("stage3"),
              new Duration(70),
              new Status("SUCCESS"),
            ),
          ]),
        ),
        new Build(
          new BuildId("2"),
          new Duration(320),
          new Status("FAILED"),
          new Stages([
            new Stage(
              new StageName("stage1"),
              new Duration(300),
              new Status("SUCCESS"),
            ),
            new Stage(
              new StageName("stage2"),
              new Duration(20),
              new Status("FAILED"),
            ),
          ]),
        ),
      ]);
      driver.findBuildsBy.calledWith("jobId").mockResolveValueOnce([
        { job_id: "jobId", build_id: "1", duration: 250, status: "SUCCESS" },
        { job_id: "jobId", build_id: "2", duration: 320, status: "FAILED" },
      ]);

      driver.findStagesBy.calledWith("jobId", "1").mockResolveValueOnce([
        {
          job_id: "jobId",
          build_id: "1",
          name: "stage1",
          duration: 100,
          status: "SUCCESS",
        },
        {
          job_id: "jobId",
          build_id: "1",
          name: "stage2",
          duration: 80,
          status: "SUCCESS",
        },
        {
          job_id: "jobId",
          build_id: "1",
          name: "stage3",
          duration: 70,
          status: "SUCCESS",
        },
      ]);
      driver.findStagesBy.calledWith("jobId", "2").mockResolveValueOnce([
        {
          job_id: "jobId",
          build_id: "2",
          name: "stage1",
          duration: 300,
          status: "SUCCESS",
        },
        {
          job_id: "jobId",
          build_id: "2",
          name: "stage2",
          duration: 20,
          status: "FAILED",
        },
      ]);

      const actual = await target.getBuilds(new JobId("jobId"));
      expect(actual).toEqual(expected);
      expect(driver.findBuildsBy.mock.calls.length).toBe(1);
      expect(driver.findStagesBy.mock.calls.length).toBe(2);
    });
  });
});

export {};
