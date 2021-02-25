import { usecase } from "./batch/usecase.ts";

async function main() {
  await usecase.registerJobs();
}

main();
