import { FCC } from "./FCC.ts";

export class Limit {
  constructor(readonly value: number) {}

  latest<T>(values: T[]): T[] {
    return values.slice(-this.value);
  }
}

function log<T>(x: T): T {
  console.log(x)
  return x;
}

export class Builds extends FCC<Build> {
  extractSucceeded() {
    return new Builds(this.values.filter(it => it.status.isSuccess()));
  }

  latestLimit(limit: Limit) {
    return new Builds(limit.latest(this.values));
  }

  validStageNames() {
    const list = [...new Set(this.values.map(it => it.validStageNames()).flat().map(it => it.value))].map(it => new StageName(it));
    return new StageNames(list);
  }

  buildIds() {
    return this.values.map(it => it.id);
  }

  stageDurationsBy(stageName: StageName) {
    return this.values.map(it => it.stageDurationBy(stageName));
  }
}

export class BuildId {
  constructor(readonly value: string) {}
}

export class Status {
  constructor(readonly value: string) {}

  isSuccess() {
    return this.value === "SUCCESS";
  }
}

export class Duration {
  constructor(readonly value: number) {}

  toMinutes() {
    return this.value / (1000 * 60);
  }
}

export class Build {
  constructor(
    readonly id: BuildId,
    readonly status: Status,
    readonly duration: Duration,
    readonly stages: Stages,
  ) {}

  validStageNames() {
    return this.stages.excludeIgnoredStage().names();
  }

  stageDurationBy(stageName: StageName) {
    return this.stages.find(stage => stage.name.value === stageName.value)?.durationMinutes() ?? null;
  }
}

export class Stages extends FCC<Stage> {
  names() {
    return this.values.map(it => it.name);
  }

  excludeIgnoredStage() {
    return new Stages(this.values.filter(it => !it.isIgnoredStage()));
  }
}

export class StageNames extends FCC<StageName> {}

export class StageName {
  constructor(readonly value: string) {}

  isIgnoredStage() {
    return this.value === "check deploy for production";
  }
}

export class Stage {
  constructor(
    readonly name: StageName,
    readonly status: Status,
    readonly duration: Duration
  ) {}

  isIgnoredStage() {
    return this.name.isIgnoredStage() || this.durationMinutes() < 1;
  }

  durationMinutes() {
    return this.duration.toMinutes();
  }
}
