import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

// Simple connection pool (sqlite3 is serialized internally for each DB handle,
// and we keep a single handle for the dev server lifecycle).
let db: sqlite3.Database | null = null;

function getDbFile(): string {
  const dbDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  return path.join(dbDir, "bbpc.sqlite");
}

export function openDb(): sqlite3.Database {
  if (db) return db;

  const filename = getDbFile();
  db = new sqlite3.Database(filename);

  // Foreign keys are off by default in SQLite.
  db.exec("PRAGMA foreign_keys = ON;");

  return db;
}

export function runDb(sql: string, params: unknown[] = []): Promise<void> {
  const database = openDb();
  return new Promise((resolve, reject) => {
    database.run(sql, params, function (err) {
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
    database.get(sql, params, (err, row) => {
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
    database.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

