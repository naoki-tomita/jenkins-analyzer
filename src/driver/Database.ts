import { instanceOf } from "../../deps.ts";
import { DB } from "../../deps.ts";

export class Database {
  db: DB;
  constructor() {
    this.db = new DB("./data.db");
  }

  query<T>(sql: string, params: any[] = []): T[] {
    return [...this.db.query(sql, params).asObjects<T>()];
  }

  transaction<T>(cb: () => T): T {
    try {
      this.db.query("BEGIN;");
      const result = cb();
      this.db.query("COMMIT;");
      return result;
    } catch (e) {
      this.db.query("ROLLBACK;");
      throw e;
    }
  }
}

export const transactional: MethodDecorator = (
  target: any,
  key,
) => {
  const originalFn: (...args: any[]) => any = target[key];
  target[key] = function (...args: any[]) {
    const database = instanceOf(Database) as Database;
    return database.transaction(() => originalFn.bind(this)(...args));
  };
  return target;
};
