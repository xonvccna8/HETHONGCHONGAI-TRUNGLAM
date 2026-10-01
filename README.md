# ORIGIN AI

ORIGIN AI là workspace kiểm tra trùng lặp, truy tìm nguồn và hỗ trợ nâng cao tính nguyên bản của văn bản. Sản phẩm không đưa ra phán quyết đạo văn hay khẳng định chắc chắn văn bản do AI tạo; mỗi kết quả đều được trình bày như một chỉ báo có lý do và giới hạn rõ ràng.

## MVP hiện có

- Landing page, đăng ký/đăng nhập Firebase bằng email hoặc Google, khôi phục mật khẩu và workspace responsive, light/dark mode.
- Dán văn bản hoặc đọc DOCX, PDF, TXT, MD (tối đa 10 MB).
- Parser theo section → paragraph → sentence với ID và fingerprint ổn định.
- Evidence Graph v2 kết hợp multi-resolution shingles/containment, fuzzy alignment, semantic embeddings/cosine và weighted scoring trên từng đoạn nguồn cục bộ.
- Phân loại exact, high similarity, semantic overlap, common knowledge, quote, cited và missing citation.
- Source Map với multi-query planner (exact, keyword, paraphrase, dịch chéo ngôn ngữ) và adapter OpenAI Web Search, Tavily hoặc Serper; chỉ dùng URL xuất hiện trong retrieval thật.
- GPT‑6 Astra kiểm chứng từng cặp đoạn đáng ngờ thành exact, paraphrase, translation, shared-topic, unrelated hoặc inconclusive; điểm máy xác định vẫn được giữ riêng để tránh AI tự xác nhận chính nó.
- AI Council gồm sáu chuyên gia song song và một Quality Reviewer, có phản biện chéo, lưu disagreement và model routing theo vai trò.
- Sentence-level review, exact/fuzzy/semantic score và giải thích.
- Originality Rewrite Agent với bốn chế độ, Responses API Structured Outputs và fallback cục bộ khi chưa có khóa.
- Citation Guard, Fact Preservation, AI Authorship Ensemble và Human Writing Coach.
- AI Authorship Ensemble kết hợp tín hiệu văn phong, GPT‑6 Astra phản biện, Copyleaks, FAID và VietAIDetector; detector chưa cấu hình được hiển thị rõ thay vì âm thầm tạo điểm giả.
- Phân tích tác giả theo từng đoạn, đo mức đồng thuận và chủ động trả về “chưa đủ bằng chứng” khi các detector xung đột.
- Bằng chứng quá trình ghi nhận tỷ lệ nhập trực tiếp, dán, nhập tệp, AI hỗ trợ, thời gian chỉnh sửa và số phiên bản; đây là dữ liệu hỗ trợ, không phải chữ ký pháp lý.
- Human Revision Coach cho phép biên tập hàng loạt các đoạn máy móc dựa trên mẫu văn thật của người dùng; đoạn thiếu thông tin cá nhân được giữ nguyên và chuyển thành câu hỏi thay vì bịa nội dung. Mọi thay đổi đều qua Fact Preservation, duyệt trước–sau và được ghi nhận là AI hỗ trợ.
- Preview/accept rewrite, before/after, version history, restore và smart rescan theo fingerprint.
- Report có bản in/PDF và bản Word-compatible.
- PostgreSQL + pgvector schema, Redis/BullMQ worker, Docker Compose.
- Bộ test và benchmark tiếng Việt.

## Kiến trúc

Xem [ARCHITECTURE.md](./ARCHITECTURE.md). Frontend và API dùng Next.js 16 + strict TypeScript. Pure NLP logic nằm trong `src/core`; các adapter OpenAI/search nằm trong `src/ai`; persistence nằm trong `src/db`; tác vụ dài chạy qua BullMQ trong `src/workers`.

OpenAI model IDs không được hard-code trong business logic. Giá trị mặc định ở `.env.example` phản ánh tài liệu chính thức tại thời điểm xây dựng: `gpt-6-astra` cho reasoning, `gpt-6-luna` cho tác vụ nhanh và `text-embedding-3-large` cho embeddings. Có thể thay tất cả bằng biến môi trường.

## Chạy nhanh

### Không dùng dịch vụ ngoài

```bash
cp .env.example .env
npm install
npm run dev
```

Mở `http://localhost:3000` và tạo tài khoản bằng Firebase Authentication. Trước lần chạy đầu, bật Email/Password và Google trong Firebase Console → Authentication → Sign-in method; thêm tên miền local/production vào Authorized domains.

Chế độ này vẫn chạy exact, fuzzy, citation, fact preservation và writing signals thực. Giao diện nói rõ khi chưa cấu hình web search/embeddings; hệ thống không tạo nguồn giả.

### Full stack bằng Docker

```bash
cp .env.example .env
docker compose up --build
```

Các service: PostgreSQL 17 + pgvector, Redis 7, Next.js web và BullMQ worker. PostgreSQL khởi tạo extension `vector` và `pgcrypto` tự động.

## Biến môi trường

Sao chép `.env.example`; không commit `.env`.

- `OPENAI_API_KEY`: bật embeddings, reasoning/rewrite và OpenAI Web Search.
- `OPENAI_REASONING_MODEL`, `OPENAI_FAST_MODEL`, `OPENAI_EMBEDDING_MODEL`: model routing.
- `AI_COUNCIL_ENABLED`: bật hội đồng AI; mặc định `false` để kiểm soát chi phí.
- `AI_COUNCIL_TRIGGER`: `suspicious` chỉ chạy khi có tín hiệu đáng ngờ; `always` chạy với mọi tài liệu.
- `AI_AGENT_*_MODEL`: chọn model riêng cho từng specialist và Quality Reviewer.
- `AI_AUTHORSHIP_REVIEW_ENABLED`, `AI_AUTHORSHIP_REVIEW_MODEL`: bật bộ phản biện tác giả bằng OpenAI Structured Outputs.
- `COPYLEAKS_EMAIL`, `COPYLEAKS_API_KEY`: bật Copyleaks AI Detector; `COPYLEAKS_SENSITIVITY` nhận giá trị 1–3.
- `FAID_API_URL`, `FAID_API_TOKEN`: kết nối dịch vụ FAID chạy trên GPU. Endpoint nhận `{ text, language }` và trả `probabilities` hoặc `scores` gồm `human`, `llm`/`ai`, `collaborative`/`mixed`.
- `VIET_AI_DETECTOR_API_URL`, `VIET_AI_DETECTOR_API_TOKEN`: kết nối VietAIDetector chạy trên GPU. Endpoint nhận `{ text, language, thresholdMode }` và trả điểm `ai`/`human` hoặc `ai_score`.
- `DATABASE_URL`: persistence PostgreSQL; nếu bỏ trống app chạy session mode.
- `REDIS_URL`: queue, progress và cache; nếu bỏ trống scan chạy inline.
- `SEARCH_PROVIDER`: `openai`, `tavily`, `serper` hoặc `none`.
- `SEARCH_API_KEY`: khóa Tavily/Serper (OpenAI dùng `OPENAI_API_KEY`).
- `AI_SEARCH_QUERY_PLANNER_ENABLED`: tạo thêm truy vấn paraphrase và chéo ngôn ngữ bằng model nhanh.
- `AI_SIMILARITY_VERIFIER_ENABLED`, `AI_SIMILARITY_VERIFIER_MODEL`: bật bộ kiểm chứng quan hệ giữa đoạn tài liệu và đoạn nguồn.
- `SOURCE_DISCOVERY_MAX_QUERIES`, `SOURCE_DISCOVERY_MAX_SOURCES`: giới hạn bề rộng truy tìm nguồn và chi phí.
- `S3_*`: cấu hình object storage S3-compatible cho production.
- `AUTH_SECRET`: khóa ký cookie; bắt buộc phải là chuỗi dài ngẫu nhiên ở production.
- `NEXT_PUBLIC_FIREBASE_*`: cấu hình Firebase Web được đóng gói ở phía trình duyệt; API key Firebase là định danh công khai và vẫn cần giới hạn API/domain trong Google Cloud Console.
- `FIREBASE_WEB_API_KEY`: bản cấu hình phía máy chủ dùng để kiểm tra Firebase ID token trước khi tạo cookie HTTP-only.
- `ENABLE_DEMO_AUTH`: chỉ bật khi cần kiểm thử đăng nhập cũ trong môi trường nội bộ; mặc định tắt.

## Database migration

```bash
npm run db:generate
npm run db:migrate
```

Schema bao gồm users, documents, document_versions, sections, paragraphs, sentences, chunks, embeddings, scan_jobs, similarity_matches, sources, citations, ai_analysis, rewrite_suggestions, writing_profiles và usage_logs. Document ownership được kiểm tra tại repository/API boundary.

## Kiểm tra chất lượng

```bash
npm run lint
npm run typecheck
npm test
npm run benchmark
npm run build
```

Benchmark dùng dataset tiếng Việt nội bộ gồm exact, partial, reordered, semantic, independent, quoted và cited passages. Chỉ số được in từ lần chạy thực; README không claim độ chính xác cố định.

## AI pipeline và an toàn

Văn bản người dùng luôn được đóng vai trò dữ liệu. System instruction, user task và document content được tách riêng trong mọi request. Chỉ passages đáng ngờ được gửi tới model reasoning; embeddings được batch và có thể cache theo fingerprint. Structured Outputs được kiểm tra lại bằng Zod.

Rewrite chạy theo `understand → claims/evidence/citations → restructure → rewrite → fact check → citation check`. Nếu Fact Preservation phát hiện số, tên, ngày hoặc citation bị mất/thêm, nút chấp nhận bị khóa.

## Giới hạn AI-writing detection

AI-writing analysis tổng hợp nhiều bộ máy nhưng vẫn có thể false positive với văn phong học thuật, người học ngôn ngữ, bản dịch và văn bản đã biên tập kỹ. Điểm hiển thị là chỉ báo tổng hợp, không phải xác suất pháp lý hay bằng chứng tác giả. Kết quả luôn kèm độ tin cậy, trạng thái từng detector và cảnh báo không dùng làm căn cứ duy nhất cho quyết định bất lợi.

## Production checklist

- Đặt reverse proxy/TLS, secret manager và object storage signed URL.
- Bật Email/Password và Google provider, cấu hình Authorized domains, giới hạn Firebase Web API key và cân nhắc MFA theo chính sách tổ chức.
- Áp dụng migration, backup PostgreSQL/Redis và retention job cho tài liệu ephemeral.
- Thiết lập rate limiting tập trung, audit sink và malware scanning cho file upload.
- Chạy benchmark trên corpus đúng lĩnh vực trước khi hiệu chỉnh threshold hoặc công bố chất lượng.
