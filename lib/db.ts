import { Pool } from "pg";

const globalForPg = globalThis as unknown as {
    pgPool?: Pool;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL belum dikonfigurasi");
}

export const pool =
    globalForPg.pgPool ??
    new Pool({
        connectionString,
        max: 5,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
    });

if (process.env.NODE_ENV !== "production") {
    globalForPg.pgPool = pool;
}