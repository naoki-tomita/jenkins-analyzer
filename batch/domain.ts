import { v4 } from "../deps.ts";

export class UUID {
  constructor(readonly value: string) {}
  static generate() {
    return new UUID(v4.generate());
  }
}

export class JobPath {
  constructor(readonly value: string) {}
  normalize(): string {
    return this.value.replace(/\/job/g, "");
  }
}

export class FCC<T> {
  constructor(readonly values: T[]) {}
  *[Symbol.iterator]() {
    const length = this.values.length;
    for (let i = 0; i < length; i++) {
      yield this.values[i];
    }
  }
  forEach(
    callbackfn: (value: T, index: number, array: T[]) => void,
    thisArg?: any,
  ): void {
    this.values.forEach(callbackfn, thisArg);
  }
  get length() {
    return this.values.length;
  }
}
export class Job {
  constructor(readonly jobPath: JobPath) {}
  static from(jobName: string, parentJob?: Job) {
    return new Job(new JobPath(`${parentJob?.jobPath ?? ""}/job/${jobName}`));
  }
}
export class Jobs extends FCC<Job> {}

export class JobWithId {
  constructor(
    readonly id: UUID,
    readonly job: Job,
  ) {}
}
export class JobWithIds extends FCC<JobWithId> {}

export class Duration {
  constructor(readonly value: number) {}
}
export class Status {
  constructor(readonly value: string) {}
}
export class BuildNumber {
  constructor(readonly value: string) {}
}
export class Build {
  constructor(
    readonly buildNumber: BuildNumber,
    readonly status: Status,
    readonly duration: Duration,
    readonly stages: Stages,
  ) {}
}
export class Builds extends FCC<Build> {}

export class StageName {
  constructor(readonly value: string) {}
}
export class Stage {
  constructor(
    readonly name: StageName,
    readonly status: Status,
    readonly duration: Duration,
  ) {}
}
export class Stages extends FCC<Stage> {}
