import path from "path";
import fs from "fs";

const ENABLE_SQLITE =
  process.env.BEARNIE_DB_SQLITE === "1" ||
  process.env.BEARNIE_DB_SQLITE === "true";

type Sqlite3Module = any;

type SqliteDatabase = any;


// Simple connection pool (sqlite3 is serialized internally for each DB handle,
// and we keep a single handle for the dev server lifecycle).
let db: SqliteDatabase | null = null;

function getDbFile(): string {
  const dbDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  return path.join(dbDir, "bbpc.sqlite");
}

function getSqlite3(): Sqlite3Module {
  if (!ENABLE_SQLITE) {
    throw new Error(
      "SQLite is disabled in this environment. Set BEARNIE_DB_SQLITE=1 to enable it.",
    );
  }

  // IMPORTANT: dynamic import/require prevents Vercel builds from eagerly
  // loading the native sqlite3 binding.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("sqlite3") as Sqlite3Module;
}

export function openDb(): SqliteDatabase {
  if (db) return db;

  const sqlite3 = getSqlite3();
  const filename = getDbFile();
  db = new sqlite3.Database(filename);

  // Foreign keys are off by default in SQLite.
  db.exec("PRAGMA foreign_keys = ON;");

  return db;
}

export function runDb(sql: string, params: unknown[] = []): Promise<void> {
  const database = openDb();
  return new Promise((resolve, reject) => {
    database.run(sql, params, function (err: unknown) {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function getDb<T>(
  sql: string,
  params: unknown[] = [],
): Promise<T | undefined> {
  const database = openDb();
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err: unknown, row: T) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

export function allDb<T>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const database = openDb();
  return new Promise((resolve, reject) => {
    database.all(sql, params, (err: unknown, rows: T[]) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}


