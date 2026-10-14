# tawsec

[🇬🇧 English](README.md) • **🇻🇳 Tiếng Việt**

> Học bảo mật bằng cách làm thật: skill red team đi tấn công, skill blue team đi phòng thủ, và một phòng lab purple biến cả hai thành thói quen học — chia theo từng loại lỗ hổng.

Repo này là bộ skill cho agent (Claude Code, Codex, Cursor, OpenCode…), được build bởi một người **vừa học bảo mật vừa build skill**. Mỗi loại lỗ hổng có một cặp skill: một cái chỉ cách attacker tìm ra nó, một cái chỉ cách defender xử lý nó.

```
Bạn: "test form login của tôi bằng red-broken-auth"
Agent: [check quyền] → [tấn công thủ công bằng curl] → báo cáo

Bạn: "ok giờ vá đi"
Agent: [blue-code-review] → vá → chạy lại tấn công để verify
```

## Ba đội

| Đội | Vai trò | Ở đây nghĩa là gì |
|---|---|---|
| 🔴 **Red** | Tấn công | Mỗi skill dò một loại lỗ hổng: recon, SQLi, XSS, broken auth, IDOR, SSRF. |
| 🔵 **Blue** | Phòng thủ | Review code, quét secret lộ, audit dependency, siết header, đọc log, xử lý sự cố. |
| 🟣 **Purple** | Học tập | Vòng lab: tấn công app mồi bằng skill red → vá bằng skill blue → tấn công lại để verify. Đây là chỗ học chính. |

## ⛔ Trước tiên

**Skill red chỉ dùng trên hệ thống của bạn hoặc hệ thống bạn có văn bản cho phép test** — và trên lab luyện tập ([Juice Shop](https://owasp.org/www-project-juice-shop/), [DVWA](https://github.com/digininja/DVWA), [PortSwigger Web Security Academy](https://portswigger.net/web-security) — miễn phí và rất hay). Mọi skill red đều có authorization gate, sẽ hỏi trước khi đụng vào target thật. Xem [SECURITY.md](SECURITY.md).

## Cài đặt

```bash
npx skills add tawgroup/tawsec
```

Hoặc qua Claude Code: `/plugin marketplace add tawgroup/tawsec` rồi `/plugin install tawsec`.

Khởi động lại agent, rồi thử: *"dựng lab bảo mật cho tôi"*.

## Danh sách skill

### 🔴 Red team

| Skill | Lỗ hổng | Học được gì |
|---|---|---|
| `red-recon` | Attack surface | Map subdomain, nhận diện tech stack, tìm endpoint ẩn, móc secret trong JS bundle |
| `red-sqli` | SQL / NoSQL injection | Dò tham số bằng tay, rồi dùng sqlmap xác nhận |
| `red-xss` | Cross-site scripting | Tìm sink reflected/stored/DOM, viết payload theo context |
| `red-broken-auth` | Xác thực | Liệt kê user, abuse reset password, tấn công JWT, test rate limit |
| `red-idor` | Broken access control | Đổi ID object, leo quyền ngang và dọc |
| `red-ssrf` | SSRF | Abuse tính năng fetch URL để chạm metadata cloud và service nội bộ |

### 🔵 Blue team

| Skill | Việc | Học được gì |
|---|---|---|
| `blue-code-review` | Review code | Grep sink injection, chỗ thiếu auth check, mass assignment |
| `blue-secrets-scan` | Dọn secret | Quét repo bằng gitleaks, rotate key bị lộ, pre-commit hook |
| `blue-deps-audit` | Supply chain | Audit dependency, bắt typosquat, chặn CVE trong CI |
| `blue-headers-cors` | Siết web | CSP, HSTS, cookie flag, audit CORS, check TLS |
| `blue-log-detection` | Phát hiện | Nhận diện tấn công trong log, viết alert, fail2ban |
| `blue-incident-response` | Ứng phó | Runbook "bị hack rồi": contain → eradicate → recover |

### 🟣 Purple team

| Skill | Việc |
|---|---|
| `purple-vuln-lab` | Dựng app mồi local, dẫn bạn lên thang độ khó: đọc → tấn công → vá → tấn công lại. Ghi tiến độ vào lab log. |

### 🧭 Router

| Skill | Việc |
|---|---|
| `tawsec` | Cửa vào. Nói bạn muốn gì ("hack thử staging của tôi", "siết bảo mật repo này", "dạy tôi bảo mật") — nó điều phối sang skill phù hợp. |

## Lộ trình học

Skill kiêm luôn giáo trình. **[docs/vi/LO-TRINH.md](docs/vi/LO-TRINH.md)** là lộ trình 8 tuần từ "chưa pentest bao giờ" tới "test được app của chính mình một cách có trách nhiệm", map từng tuần với skill và lab miễn phí. Kèm **[docs/vi/TU-DIEN.md](docs/vi/TU-DIEN.md)** — từ điển thuật ngữ Anh–Việt.

## Cái này KHÔNG phải

- Không thay thế pentest chuyên nghiệp
- Không phải kho zero-day hay exploit vũ khí hoá
- Không phải giấy phép test hệ thống của người khác

Mục tiêu: **hiểu từng loại lỗ hổng đủ sâu để tìm ra nó, khai thác nó trong lab, vá nó trong code, và phát hiện nó trong log.** Vòng lặp đó là cả trò chơi.

## License

MIT.
