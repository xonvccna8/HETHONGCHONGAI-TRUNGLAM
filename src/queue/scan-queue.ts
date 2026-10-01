import { Queue } from "bullmq";
import type { ScanReport } from "@/src/core/types";

export interface ScanJobData {
  text: string;
  documentId?: string;
  ownerEmail: string;
}

function connectionOptions() {
  if (!process.env.REDIS_URL) return null;
  const url = new URL(process.env.REDIS_URL);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    tls: url.protocol === "rediss:" ? {} : undefined,
  };
}

let queue: Queue<ScanJobData, ScanReport> | undefined;

export function getScanQueue() {
  const connection = connectionOptions();
  if (!connection) return null;
  if (!queue) queue = new Queue<ScanJobData, ScanReport>("origin-scan", { connection });
  return queue;
}

export function getRedisConnectionOptions() {
  return connectionOptions();
}
