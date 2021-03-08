import type { APIRequest } from "aleph/types.ts";

export default async function handler(req: APIRequest) {
  fetch("http://localhost:8081/v1/jobs")
    .then(it => it.json())
    .then(it => req.json(it));
}
