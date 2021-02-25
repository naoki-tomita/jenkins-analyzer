import { config } from "../deps.ts";

const env = config();
export const Configurations = {
  baseUrl: env.BASE_URL as string,
  jobName: env.JOB_NAME as string,
  username: env.USERNAME as string,
  password: env.PASSWORD as string,
};
