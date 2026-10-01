import type { AiWritingSignals, RiskLevel } from "./types";
import { lexicalTokens, splitSentences } from "./text";

const transitions = ["tuy nhiên", "hơn nữa", "do đó", "vì vậy", "bên cạnh đó", "nhìn chung", "đặc biệt"];
const genericPhrases = ["trong bối cảnh hiện nay", "đóng vai trò quan trọng", "không thể phủ nhận", "ngày càng phát triển", "mang lại nhiều lợi ích"];

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function analyzeWritingSignals(text: string): AiWritingSignals {
  const sentences = splitSentences(text).map((item) => item.text);
  const lengths = sentences.map((sentence) => lexicalTokens(sentence).length);
  const mean = lengths.reduce((sum, length) => sum + length, 0) / Math.max(lengths.length, 1);
  const variance = lengths.reduce((sum, length) => sum + (length - mean) ** 2, 0) / Math.max(lengths.length, 1);
  const uniformity = clamp(1 - Math.sqrt(variance) / Math.max(mean, 1));
  const tokens = lexicalTokens(text);
  const diversity = tokens.length ? new Set(tokens).size / tokens.length : 1;
  const transitionDensity = transitions.filter((item) => text.toLocaleLowerCase("vi").includes(item)).length / Math.max(sentences.length, 1);
  const genericDensity = genericPhrases.filter((item) => text.toLocaleLowerCase("vi").includes(item)).length / Math.max(sentences.length, 1);
  const repeatedBigrams = (() => {
    const grams = tokens.slice(0, -1).map((token, index) => `${token} ${tokens[index + 1]}`);
    return grams.length ? clamp(1 - new Set(grams).size / grams.length) : 0;
  })();
  const score = clamp(uniformity * 0.27 + (1 - diversity) * 0.24 + clamp(transitionDensity) * 0.18 + clamp(genericDensity) * 0.19 + repeatedBigrams * 0.12);
  const percentage = Math.round(score * 100);
  const risk: RiskLevel = percentage < 24 ? "very-low" : percentage < 42 ? "low" : percentage < 64 ? "medium" : "high";
  return {
    risk,
    score: percentage,
    disclaimer: "Kết quả chỉ là chỉ báo thống kê và không chứng minh chắc chắn văn bản được viết bởi AI.",
    signals: [
      { label: "Độ đồng đều câu", score: Math.round(uniformity * 100), detail: "So sánh phân bố độ dài giữa các câu." },
      { label: "Thiếu đa dạng từ vựng", score: Math.round((1 - diversity) * 100), detail: "Mức lặp lại từ vựng; điểm cao hơn nghĩa là ít đa dạng hơn." },
      { label: "Mật độ chuyển ý", score: Math.round(clamp(transitionDensity) * 100), detail: "Tần suất các cụm chuyển ý có tính khuôn mẫu." },
      { label: "Cụm từ chung chung", score: Math.round(clamp(genericDensity) * 100), detail: "Mật độ phát biểu khái quát và ít dấu ấn cá nhân." },
    ],
  };
}
