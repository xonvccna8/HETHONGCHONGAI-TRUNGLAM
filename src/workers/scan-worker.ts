import { Worker } from "bullmq";
import { runScan } from "@/src/ai/scan";
import { getRedisConnectionOptions, type ScanJobData } from "@/src/queue/scan-queue";

const connection = getRedisConnectionOptions();
if (!connection) throw new Error("REDIS_URL is required for the scan worker");

const worker = new Worker<ScanJobData>(
  "origin-scan",
  async (job) => {
    await job.updateProgress({ percent: 12, stage: "Đang đọc tài liệu…" });
    await job.updateProgress({ percent: 28, stage: "Đang chia cấu trúc…" });
    await job.updateProgress({ percent: 44, stage: "Đang phân tích trùng lặp…" });
    const report = await runScan(job.data.text);
    await job.updateProgress({ percent: 78, stage: "Đang kiểm tra citation…" });
    await job.updateProgress({ percent: 94, stage: "Đang tạo báo cáo…" });
    return report;
  },
  { connection, concurrency: 3 },
);

worker.on("completed", (job) => console.info(`Scan job ${job.id} completed`));
worker.on("failed", (job, error) => console.error(`Scan job ${job?.id ?? "unknown"} failed`, error));

async function shutdown() {
  await worker.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
