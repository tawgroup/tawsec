# Từ điển thuật ngữ bảo mật Anh–Việt

Thuật ngữ bảo mật toàn tiếng Anh và nên giữ nguyên tiếng Anh khi dùng — bảng này để hiểu bản chất, không phải để dịch. Sắp xếp theo nhóm.

## Đội hình & vai trò

| Thuật ngữ | Nghĩa |
|---|---|
| **Red team** | Đội tấn công giả lập — đóng vai attacker để tìm lỗ hổng trước kẻ xấu |
| **Blue team** | Đội phòng thủ — vá, giám sát, phát hiện, ứng phó |
| **Purple team** | Không hẳn là "đội" — là hoạt động kết hợp red + blue để học và cải thiện cả hai |
| **Pentest (penetration test)** | Test xâm nhập có ủy quyền, trong scope và thời gian chốt trước |
| **Bug bounty** | Chương trình thưởng tiền cho ai tìm và báo lỗ hổng đúng quy định |
| **Scope** | Phạm vi được phép test. Ra ngoài scope = phạm pháp, đơn giản vậy |

## Tấn công

| Thuật ngữ | Nghĩa |
|---|---|
| **Attack surface** | Bề mặt tấn công — tổng mọi thứ attacker nhìn thấy: subdomain, endpoint, port, tính năng |
| **Recon(naissance)** | Trinh sát — giai đoạn thu thập thông tin trước khi tấn công |
| **Payload** | Chuỗi/mã độc chèn vào input để khai thác (vd `' OR 1=1--`) |
| **Source** | Nơi dữ liệu attacker kiểm soát đi vào (param, body, header) |
| **Sink** | Nơi dữ liệu đó gây hại (câu query, shell, HTML, file) |
| **Injection** | Lỗi input của user trở thành một phần của câu lệnh (SQL, shell, template...) |
| **XSS (cross-site scripting)** | Chèn JavaScript độc vào trang web chạy trên trình duyệt nạn nhân |
| **IDOR** | Đổi ID của object (URL/body) để truy cập dữ liệu người khác — server quên check quyền sở hữu |
| **SSRF** | Ép server tự gọi request tới URL attacker chọn → lọt vào mạng nội bộ |
| **RCE (remote code execution)** | Chạy được code tùy ý trên server — đỉnh của chuỗi khai thác |
| **Privilege escalation** | Leo thang đặc quyền: ngang (user→user khác) hoặc dọc (user→admin) |
| **Brute force / password spraying** | Thử mật khẩu hàng loạt / thử 1 mật khẩu phổ biến trên nhiều tài khoản |
| **Enumeration** | Liệt kê — dò xem username/email nào tồn tại qua phản hồi khác nhau của server |
| **Token / JWT** | Phiếu xác thực sau login; JWT là dạng tự chứa thông tin, ký bằng secret |
| **Session fixation** | Ép nạn nhân dùng session ID attacker chuẩn bị sẵn |
| **Subdomain takeover** | Subdomain trỏ CNAME tới dịch vụ cloud đã xóa → attacker đăng ký lại và chiếm |
| **Typosquatting** | Package/tên miền sai chính tả 1 ký tự, chờ người gõ nhầm |
| **Dependency confusion** | Đăng package trùng tên package nội bộ lên registry public để build tool kéo nhầm |

## Phòng thủ

| Thuật ngữ | Nghĩa |
|---|---|
| **Defense in depth** | Phòng thủ nhiều lớp — một lớp thủng vẫn còn lớp khác (vd escape output + CSP cùng chống XSS) |
| **Least privilege** | Quyền tối thiểu — DB user của app không cần quyền DROP, JWT không cần sống 30 ngày |
| **Parameterized query / prepared statement** | Tách data khỏi câu SQL — thuốc giải của SQLi |
| **Output encoding** | Mã hoá dữ liệu theo đúng context khi render — thuốc giải của XSS |
| **CSP (Content-Security-Policy)** | Header khai báo nguồn script/style hợp lệ — lớp chống XSS thứ hai |
| **HSTS** | Header ép trình duyệt chỉ dùng HTTPS |
| **SameSite / HttpOnly / Secure** | 3 cờ cookie: chống CSRF / JS không đọc được / chỉ gửi qua HTTPS |
| **CORS** | Cơ chế trình duyệt cho phép/không cho web khác đọc response của API mình |
| **Rate limiting** | Giới hạn số request — chống brute force, scraping |
| **Secret rotation** | Thu hồi & cấp lại key/token. Khi lộ secret: rotate TRƯỚC, dọn lịch sử git SAU |
| **Canary token** | Mồi cảnh báo (key giả, URL giấu) — ai đụng vào là có khách |
| **Egress control** | Kiểm soát traffic ĐI RA của server — chặn SSRF ở tầng mạng |
| **IMDSv2** | Bản metadata service an toàn hơn của AWS — chống SSRF ăn credential |

## Ứng phó & quy trình

| Thuật ngữ | Nghĩa |
|---|---|
| **Incident** | Sự cố bảo mật thật (không phải báo động giả) |
| **Contain / Eradicate / Recover** | 3 pha xử lý sự cố: khoanh vùng → dọn sạch → phục hồi |
| **IOC (indicator of compromise)** | Dấu hiệu bị xâm nhập: IP lạ, file lạ, hash malware |
| **Postmortem** | Rút kinh nghiệm sau sự cố — blameless, tập trung vào nguyên nhân hệ thống |
| **Responsible disclosure** | Báo lỗ hổng riêng tư cho chủ sở hữu, cho thời gian vá trước khi công khai |
| **CVE** | Mã định danh lỗ hổng công khai (vd CVE-2024-1234) |
| **CVSS** | Thang điểm độ nghiêm trọng của CVE (0-10) |
| **PoC (proof of concept)** | Minh chứng khai thác — nên tối thiểu, chỉ đủ chứng minh lỗi tồn tại |
| **False positive** | Báo động giả — tưởng lỗ hổng hoá không phải |
| **Blind (SQLi/XSS/SSRF)** | Khai thác không thấy kết quả trực tiếp — phải đo qua thời gian phản hồi, kích thước response |

## Lab & tài nguyên

| Tên | Là gì |
|---|---|
| **OWASP Juice Shop** | App web cố tình lỗi đầy để luyện — chạy local bằng Docker |
| **DVWA** | Damn Vulnerable Web App — PHP, hợp luyện SQLi cơ bản |
| **PortSwigger Web Security Academy** | Học viện lab miễn phí theo chủ đề, từ apprentice tới expert — tốt nhất hiện nay |
| **HackTheBox / TryHackMe** | Sân luyện máy thật hợp pháp, có trả phí lẫn miễn phí |
| **OWASP Top 10** | 10 loại lỗ hổng web phổ biến nhất — khung xương của mọi giáo trình |
