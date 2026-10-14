# Lộ trình học bảo mật 8 tuần — từ số 0 tới test được app của chính mình

> English version: [../ROADMAP.md](../ROADMAP.md)

**Mục tiêu:** sau 8 tuần, bạn tự test bảo mật được app web của mình một cách có trách nhiệm — tìm được các lỗi phổ biến, vá được, phát hiện được khi có người thử tấn công, và biết phải làm gì khi thật sự bị hack.

**Thời lượng:** ~3-4 tiếng/tuần. Mỗi tuần một loại lỗ hổng. Vòng lặp của mọi tuần: **đọc → tấn công trong lab → vá → tấn công lại để verify → ghi log**.

**Dụng cụ:** Docker, curl, devtools của trình duyệt. Cái khác cài dần dọc đường.

> 💡 Mẹo học: thuật ngữ giữ nguyên tiếng Anh (payload, sink, token, IDOR...) vì toàn bộ tutorial/công việc đều dùng vậy. Tra nhanh ở [TU-DIEN.md](TU-DIEN.md).

## Tuần 0 — Dựng lab & máu đầu tiên

- [ ] Gọi skill `purple-vuln-lab`: chạy Juice Shop bằng Docker, tạo `LAB-LOG.md`
- [ ] Tự mò giải 1 challenge (gợi ý: trang scoreboard bị giấu đâu đó)
- [ ] Đọc README repo này để hiểu red / blue / purple team là gì

## Tuần 1 — Recon & lộ thông tin

- [ ] Chạy `red-recon` lên domain của chính bạn: crt.sh, Wayback Machine, GitHub code search, grep JS bundle
- [ ] Juice Shop: tìm scoreboard, tìm thư mục `/ftp`
- [ ] PortSwigger: lab Information disclosure (mức apprentice)
- [ ] **Check app thật:** recon chính project của bạn. Có gì lộ ra mà bạn quên mất không?

## Tuần 2 — Siết phòng thủ cơ bản (tuần blue)

- [ ] `blue-headers-cors` lên app của bạn: header, cookie flag, CORS, TLS
- [ ] `blue-secrets-scan` quét repo: gitleaks cả lịch sử git
- [ ] Cài pre-commit hook gitleaks + bật push protection trên GitHub
- [ ] Viết CSP ở chế độ report-only

## Tuần 3 — Injection (SQL & NoSQL)

- [ ] PortSwigger lab SQLi số 1-5 (error-based → UNION → blind)
- [ ] Juice Shop: bypass login bằng `' OR 1=1-- -`, rồi thử challenge NoSQL
- [ ] `blue-code-review` repo của bạn với checklist số 1 (injection sink)
- [ ] Vá + tấn công lại bất cứ gì tìm được

## Tuần 4 — XSS

- [ ] PortSwigger lab XSS: reflected, stored, DOM (mỗi loại 1 lab)
- [ ] Juice Shop: XSS ở ô search, stored XSS ở phần review
- [ ] `blue-code-review`: grep sink `innerHTML` / `dangerouslySetInnerHTML` trong code bạn
- [ ] Chuyển CSP từ report-only sang enforce

## Tuần 5 — Xác thực & phiên (auth)

- [ ] PortSwigger lab auth: enumeration, brute-force protection, password reset
- [ ] `red-broken-auth` lên Juice Shop: crack JWT secret yếu, reset mật khẩu của Jim
- [ ] Audit auth của app bạn: thông báo lỗi, rate limit, token reset, verify JWT
- [ ] `blue-log-detection`: đảm bảo login fail được log; đặt 1 alert đầu tiên

## Tuần 6 — Access control / IDOR

- [ ] PortSwigger lab access control (hết apprentice + practitioner)
- [ ] Juice Shop: xem giỏ hàng của user khác, vào admin section bằng forced browsing
- [ ] `red-idor` lên APP CỦA BẠN với 2 tài khoản test — bài tập đáng giá nhất cả lộ trình
- [ ] Vá bằng middleware authorize tập trung, đừng rải if lẻ tẻ

## Tuần 7 — SSRF & supply chain

- [ ] PortSwigger lab SSRF
- [ ] `blue-deps-audit` repo của bạn: CVE, check typosquat, cấu hình Dependabot, gate CI
- [ ] Rà các tính năng fetch URL của app bạn (webhook, proxy ảnh, preview link)
- [ ] Egress: server app của bạn có reach được 169.254.169.254 không? Có nên không?

## Tuần 8 — Tốt nghiệp: full pass trên app của bạn

- [ ] `red-recon` → chọn 2 loại lỗ hổng → tấn công → `blue-code-review` → vá → tấn công lại
- [ ] `blue-log-detection`: đọc log tuần qua — tự tìm vết tấn công của chính mình trong log
- [ ] Viết report 1 trang: findings, severity, cách vá, rủi ro còn lại
- [ ] Bookmark `blue-incident-response` — mong là không bao giờ cần, nhưng giờ thì đã có sẵn

## Sau lộ trình

- Lab PortSwigger mức practitioner/expert theo từng chủ đề — miễn phí mãi mãi
- HackerOne CTF / HackTheBox starting points — vẫn hợp pháp, vẫn là lab
- Đọc writeup bug bounty thật (HackerOne Hacktivity) và tự hỏi: "app MÌNH có sống nổi không?"
- Khi đủ tự tin: chọn một chương trình bug bounty, đọc kỹ scope & policy 2 lần trước khi đụng vào bất cứ thứ gì
