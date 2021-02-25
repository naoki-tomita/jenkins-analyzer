import "./src/gateway/JenkinsJobGateway.ts";
import { Application, DB, register } from "./deps.ts";
import { JenkinsJobUseCase } from "./src/usecase/JenkinsJobUseCase.ts";
import { Database } from "./src/driver/Database.ts";
import { JobId } from "./src/domain/Job.ts";

const app = new Application();
const usecase = new JenkinsJobUseCase();
const db = new Database();
register(db).as(Database);

app
  .get("/v1/jobs", async (context) => {
    const result = await usecase.getJobs();
    context.json({
      jobs: result.map((it) => ({
        id: it.id.value,
        name: it.name.value,
      })),
    });
  })
  .get("/v1/jobs/:id/builds", async (context) => {
    const id = context.params.id;
    const result = await usecase.getBuilds(new JobId(id));
    context.json({
      builds: result.map((it) => ({
        id: it.id.value,
        status: it.status.value,
        duration: it.duration.value,
        stages: it.stages.map(stage => ({
          name: stage.name.value,
          status: stage.status.value,
          duration: stage.duration.value,
        })),
      })),
    });
  })
  .static("/statics", "web")
  .start({ port: 8080 });
