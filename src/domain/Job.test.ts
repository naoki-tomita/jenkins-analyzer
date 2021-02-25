import { register } from "../../deps.ts";
import { describe, expect, it, mock } from "../../test_deps.ts";
import { Builds, Build, BuildId, Duration, Status } from "../domain/Job.ts";

describe("Builds", () => {
  describe("#sortById", () => {
    it("Idの昇順でソートされること", () => {
      const b1 = new Build(new BuildId("123"), mock(), mock(), mock());
      const b2 = new Build(new BuildId("13"), mock(), mock(), mock());
      const b3 = new Build(new BuildId("131"), mock(), mock(), mock());
      const target = new Builds([b1, b2, b3]);

      expect(target.sortById()).toEqual(new Builds([b2, b1, b3]));
    });
  });
})
