import { FCC } from "./FCC.ts";

export class Columns extends FCC<Column> {
  excludeIgnoredColumns() {
    return new Columns(this.filter(it => !it.isIgnoredColumn()));
  }

  columnNames(): ColumnName[] {
    return this.map(it => it.name);
  }

  toC3Columns(): [string, ...number[]][] {
    return this.map(it => [it.name.value, ...it.values.map(it => it.value)]);
  }

  toC3Groups(): string[][] {
    return [this.columnNames().map(it => it.value)];
  }

  toC3Types(type: "area"): { [key: string]: "area" } {
    return this.columnNames().reduce((prev, curr) => ({ ...prev, [curr.value]: type }), {});
  }

  toC3Data() {
    return {
      columns: this.toC3Columns(),
      groups: this.toC3Groups(),
      types: this.toC3Types("area"),
    }
  }
}

export class ColumnName {
  constructor(readonly value: string) {}
}

export class ColumnValues extends FCC<ColumnValue> {
  max() {
    return new ColumnValue(Math.max(...this.map(it => it.value)));
  }
}

export class ColumnValue {
  constructor(readonly value: number) {}

  isLessEqualThan(value: number) {
    return this.value <= value;
  }
}

export class Column {
  constructor(
    readonly name: ColumnName,
    readonly values: ColumnValues
  ) {}

  isIgnoredColumn() {
    return this.values.max().isLessEqualThan(1);
  }
}
