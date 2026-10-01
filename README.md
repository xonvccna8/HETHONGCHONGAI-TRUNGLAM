# ORIGIN AI

ORIGIN AI là workspace kiểm tra trùng lặp, truy tìm nguồn và hỗ trợ nâng cao tính nguyên bản của văn bản. Sản phẩm không đưa ra phán quyết đạo văn hay khẳng định chắc chắn văn bản do AI tạo; mỗi kết quả đều được trình bày như một chỉ báo có lý do và giới hạn rõ ràng.

## MVP hiện có

- Landing page, đăng nhập và workspace responsive, light/dark mode.
- Dán văn bản hoặc đọc DOCX, PDF, TXT, MD (tối đa 10 MB).
- Parser theo section → paragraph → sentence với ID và fingerprint ổn định.
- Pipeline exact shingles/Jaccard, fuzzy Levenshtein/token overlap, semantic embeddings/cosine và weighted scoring.
- Phân loại exact, high similarity, semantic overlap, common knowledge, quote, cited và missing citation.
- Source Map với adapter OpenAI Web Search, Tavily hoặc Serper; chỉ dùng URL xuất hiện trong retrieval thật.
- AI Council gồm sáu chuyên gia song song và một Quality Reviewer, có phản biện chéo, lưu disagreement và model routing theo vai trò.
- Sentence-level review, exact/fuzzy/semantic score và giải thích.
- Originality Rewrite Agent với bốn chế độ, Responses API Structured Outputs và fallback cục bộ khi chưa có khóa.
- Citation Guard, Fact Preservation, AI Writing Signal Engine và Human Writing Coach.
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

Mở `http://localhost:3000`. Ở môi trường development, tài khoản mặc định là `demo@origin.ai` / `origin2026`. Hãy đổi hoặc xóa thông tin này khi triển khai.

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
- `DATABASE_URL`: persistence PostgreSQL; nếu bỏ trống app chạy session mode.
- `REDIS_URL`: queue, progress và cache; nếu bỏ trống scan chạy inline.
- `SEARCH_PROVIDER`: `openai`, `tavily`, `serper` hoặc `none`.
- `SEARCH_API_KEY`: khóa Tavily/Serper (OpenAI dùng `OPENAI_API_KEY`).
- `S3_*`: cấu hình object storage S3-compatible cho production.
- `AUTH_SECRET`: khóa ký cookie; bắt buộc phải là chuỗi dài ngẫu nhiên ở production.
- `DEMO_LOGIN_EMAIL`, `DEMO_LOGIN_PASSWORD`: tài khoản local; thay bằng SSO/OIDC khi production.

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

AI-writing analysis dựa trên phân bố độ dài câu, lexical diversity, repetition, transition density, uniformity và generic phrasing. Các feature này có false positive với văn phong học thuật, người học ngôn ngữ và văn bản đã biên tập kỹ. Vì vậy giao diện chỉ hiển thị Very Low/Low/Medium/High kèm cảnh báo, không gắn nhãn tác giả và không hỗ trợ “bypass detector”.

## Production checklist

- Đặt reverse proxy/TLS, secret manager và object storage signed URL.
- Thay tài khoản demo bằng OIDC/SSO và bật MFA theo chính sách tổ chức.
- Áp dụng migration, backup PostgreSQL/Redis và retention job cho tài liệu ephemeral.
- Thiết lập rate limiting tập trung, audit sink và malware scanning cho file upload.
- Chạy benchmark trên corpus đúng lĩnh vực trước khi hiệu chỉnh threshold hoặc công bố chất lượng.
