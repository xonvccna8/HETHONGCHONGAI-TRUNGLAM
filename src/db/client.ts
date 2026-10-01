import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let cached: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!process.env.DATABASE_URL) return null;
  if (!cached) {
    const client = postgres(process.env.DATABASE_URL, { max: 8, idle_timeout: 20, connect_timeout: 8 });
    cached = drizzle(client, { schema });
  }
  return cached;
}
