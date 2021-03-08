import { useDeno } from "aleph";
import React, { useState, useEffect } from "react";
import { useC3 } from "../lib/C3.ts";
import { Builds, Build, BuildId, Status, Duration, Stages, Stage, StageName, Limit } from "../domains/Build.ts";
import { Column, ColumnName, Columns, ColumnValue, ColumnValues } from "../domains/Column.ts";

const Home = () => {
  const [[data, categories] = [], setChartData] = useState<Parameters<typeof useC3> | undefined>(undefined);
  useC3(data, categories);
  const { jobs } = useDeno<{
    jobs: Array<{
      id: string;
      name: string;
      path: string;
    }>;
  }>(async () => fetch("http://localhost:8080/api/v1/jobs").then(it => it.json()));
  const [state, setState] = useState(jobs?.[0]?.id);

  useEffect(() => {
    if (state) {
      loadBuilds(state);
    }
  }, [state]);

  async function loadBuilds(id: string) {
    const { builds: list } = await fetch(`http://localhost:8080/api/v1/jobs/${id}/builds`).then(it => it.json()) as {
      builds: Array<{
        id: string;
        status: string;
        duration: number;
        stages: Array<{
          name: string;
          status: string;
          duration: number;
        }>;
      }>;
    };
    console.log("loadBuilds", id)
    const builds = new Builds(list.map(b =>
      new Build(
        new BuildId(b.id),
        new Status(b.status),
        new Duration(b.duration),
        new Stages(b.stages.map(s =>
          new Stage(
            new StageName(s.name),
            new Status(s.status),
            new Duration(s.duration))
        ))
      )
    ));
    const latestBuilds = builds.extractSucceeded().latestLimit(new Limit(200));
    const stageNames = latestBuilds.validStageNames();
    const buildIds = latestBuilds.buildIds();
    const columns = new Columns(stageNames.map(it =>
      new Column(
        new ColumnName(it.value),
        new ColumnValues(
          latestBuilds.stageDurationsBy(it)
            .filter((it): it is number => it != null)
            .map(v => new ColumnValue(v))
        )
      )
    ));

    setChartData([columns.toC3Data(), buildIds.map(it => it.value)]);
  }

  return (
    <>
    <select value={state} onChange={e => setState((e.target as any).value)}>
      {(jobs ?? []).map(it => (
        <option key={it.id} value={it.id}>{it.name}</option>)
      )}
    </select>
    <div id="chart"></div>
    </>
  );
}

export default Home;
