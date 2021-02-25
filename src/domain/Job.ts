export class JobName {
  constructor(readonly value: string) {}
}

export abstract class FCC<T> {
  constructor(readonly values: T[]) {}
  map<U>(
    callbackfn: (value: T, index: number, array: T[]) => U,
    thisArg?: any,
  ): U[] {
    return this.values.map(callbackfn, thisArg);
  }

  sort(compareFn?: (a: T, b: T) => number): T[] {
    return this.values.slice().sort(compareFn);
  }
}

export class JobId {
  constructor(readonly value: string) {}
}

export class Job {
  constructor(
    readonly id: JobId,
    readonly name: JobName,
  ) {}
}

export class Jobs extends FCC<Job> {
}

export class BuildId {
  constructor(readonly value: string) {}

  parseInt() {
    return Number.parseInt(this.value, 10);
  }
}

export class Duration {
  constructor(readonly value: number) {}
}

export class Status {
  constructor(readonly value: string) {}
}

export class Build {
  constructor(
    readonly id: BuildId,
    readonly duration: Duration,
    readonly status: Status,
    readonly stages: Stages,
  ) {}
}

export class Builds extends FCC<Build> {
  sortById() {
    return new Builds(this.sort((a, b) => a.id.parseInt() - b.id.parseInt()));
  }
}

export class Stages extends FCC<Stage> {}

export class StageName {
  constructor(readonly value: string) {}
}
export class Stage {
  constructor(
    readonly name: StageName,
    readonly duration: Duration,
    readonly status: Status,
  ) {}
}
