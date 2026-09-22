# 🥮 Hướng Dẫn Sử Dụng Mini Game "Xếp Bánh Đón Trăng" & Auto Bot

Tài liệu hướng dẫn chi tiết cách chạy Local Server, cài đặt Chrome Extension và sử dụng Auto Bot với khả năng tùy chỉnh điểm số và thời gian theo mong muốn.

---

## 📁 1. Cấu Trúc Dự Án

```text
minigame/
├── mini-game-xep-banh-don-trang.html   # Giao diện chính của minigame
├── game-connector.js                   # Logic engine vẽ Canvas 2.5D, vật lý thả bánh
├── minigame.js                         # SDK client giao tiếp API máy chủ (chữ ký HMAC-SHA256)
├── icon.js                             # Tài nguyên SVG icons
├── anti.js                             # Mã nguồn chặn F12 / DevTools (đã vô hiệu hóa cục bộ)
├── share.js                            # Thư viện chia sẻ Facebook / Zalo
├── server.py                           # Local Server Python (Mock API + Cache Static Assets)
├── local_data.json                     # Cơ sở dữ liệu cục bộ (Lưu điểm, lượt chơi, BXH)
├── auto_bot.js                         # Script Auto Play tích hợp trực tiếp vào web
├── extension/                          # Tiện ích mở rộng Chrome Extension (Manifest V3)
│   ├── manifest.json                   # Cấu hình tiện ích mở rộng
│   └── content.js                      # Mã nguồn can thiệp Canvas & bảng điều khiển HUD
└── _cache/                             # Thư mục tự động lưu đệm hình ảnh/CSS tải từ web gốc
```

---

## 🚀 2. Hướng Dẫn Chạy Local Server

Máy của bạn đã cài sẵn Python 3. Bạn có thể khởi động server nội bộ chỉ với 1 dòng lệnh:

### Khởi động Server:
```bash
# Chạy mặc định trên cổng 3000
python3 server.py

# Hoặc chỉ định cổng tùy ý nếu muốn:
python3 server.py 8888
```

### Truy cập Game:
Mở trình duyệt bất kỳ (Chrome, Cốc Cốc, Edge, Firefox) và truy cập:
👉 **[http://localhost:3000](http://localhost:3000)**

### Các tính năng của Local Server:
* **Tự động mở rộng thời hạn:** Không bao giờ bị lỗi *"Sự kiện đã kết thúc"*.
* **Giả lập đầy đủ API (Mock Backend):**
  * `step=init`: Cấp lượt chơi và token người chơi.
  * `step=play`: Bắt đầu ván và ghi nhận điểm số khi kết thúc.
  * `step=ranking`: Bảng xếp hạng trực tiếp được cập nhật vào [local_data.json](file:///home/nvpa/minigame/local_data.json).
  * `step=share`: Tự động cộng thêm 5 lượt chơi khi bấm chia sẻ.
* **Tự động Proxy & Cache:** Toàn bộ CSS, font chữ, hiệu ứng âm thanh và ảnh bánh từ website gốc sẽ được tải đệm một lần và lưu vào thư mục `_cache/` giúp bạn chơi mượt mà kể cả khi mất mạng.
* **Tắt chặn Inspect (`anti.js`):** Tự động vô hiệu hóa lệnh anti-debug để bạn mở F12 kiểm tra thoải mái.

---

## 🧩 3. Cài Đặt & Sử Dụng Chrome Extension

Tiện ích mở rộng giúp bạn chơi tự động trên cả **Localhost** lẫn **Website chính thức của P.A Việt Nam** mà không cần mở tab Console F12.

### Các bước cài đặt:
1. Mở trình duyệt Chrome / Cốc Cốc / Brave / Edge.
2. Nhập vào thanh địa chỉ:
   ```text
   chrome://extensions
   ```
   *(Với Edge dùng `edge://extensions`, Cốc Cốc dùng `coccoc://extensions`)*
3. Gạt bật **"Developer mode"** (Chế độ dành cho nhà phát triển) ở góc trên bên phải màn hình.
4. Bấm vào nút **"Load unpacked"** (Tải tiện ích đã giải nén) ở góc trên bên trái.
5. Tìm và chọn thư mục:
   ```text
   /home/nvpa/minigame/extension
   ```
6. Cài đặt thành công! Biểu tượng tiện ích sẽ xuất hiện trên thanh công cụ của trình duyệt.

---

## 🤖 4. Hướng Dẫn Sử Dụng Auto Bot

Bảng điều khiển **"AUTO BOT TÙY CHỈNH"** sẽ xuất hiện ở góc trên bên phải màn hình khi bạn mở trang minigame.

```text
┌──────────────────────────────────────────────┐
│  ⚙️ AUTO BOT TÙY CHỈNH          [ ĐANG CHẠY ]│
├──────────────────────────────────────────────┤
│  🎯 Mục tiêu (Tầng):  [ 125 ]                │
│  ⏱️ Thời gian (Phút): [ 30  ]                │
│                               Nhịp độ: 14.4s │
├──────────────────────────────────────────────┤
│  🍰 Đã xếp: 42 / 125 tầng                    │
│  ⏳ Thời gian: 10:05 / 30:00                 │
│  ⚡ Trạng thái: Lắc bánh (8.2s)...           │
├──────────────────────────────────────────────┤
│  [  Tạm dừng  ]       [   Thả ngay   ]       │
├──────────────────────────────────────────────┤
│  Chọn nhanh:  125đ/30p  |  50đ/10p  |  Test 1p│
└──────────────────────────────────────────────┘
```

### Các chức năng chính:
1. **🎯 Tùy chỉnh Điểm số mục tiêu:**
   * Nhập số tầng bánh bạn muốn bot dừng lại (ví dụ: `20`, `50`, `80`, `125`, `200`...).
   * Khi đạt đủ số tầng này, bot sẽ **tự động thả lệch ra ngoài** để kết thúc ván chơi và gửi điểm lên hệ thống.
2. **⏱️ Tùy chỉnh Thời lượng chơi (Phút):**
   * Nhập tổng số phút mong muốn (ví dụ: `5`, `10`, `15`, `30`...).
   * Bot sẽ tự động chia đều thời gian cho từng tầng bánh, bánh sẽ lắc qua lại nhịp nhàng trên màn hình rồi mới thả, hoàn toàn tự nhiên như người chơi thật.
3. **⚡ Tự động tính nhịp độ (Pace):**
   * Hiển thị ngay số giây trung bình cần chờ ở mỗi tầng: `Nhịp độ = (Phút * 60) / Tầng`.
4. **🔘 Nút "Thả ngay":**
   * Nếu bạn đang vội và không muốn chờ bánh lắc đủ số giây ở tầng hiện tại, bấm nút này bot sẽ lập tức canh **Perfect** và thả ngay trong lần chạm kế tiếp.
5. **⭐ Các nút chọn nhanh (Presets):**
   * **`125đ / 30p`**: Mốc kỷ lục đua Top Bảng xếp hạng.
   * **`50đ / 10p`**: Mốc mở khóa Ưu đãi Cao cấp.
   * **`Test 1p`**: Chế độ test siêu tốc 125 tầng chỉ trong 1 phút.
6. **💾 Tự động lưu cấu hình (LocalStorage):**
   * Thông số bạn vừa nhập sẽ được lưu lại, lần sau mở trang web lên không cần gõ lại.

---

## 💻 5. Chạy Bằng Console Trình Duyệt (Không Cần Extension)

Nếu bạn không muốn cài extension, bạn có thể chạy bot trực tiếp qua tab Console:

1. Mở game tại: **[http://localhost:3000](http://localhost:3000)**.
2. Nhấn **F12** -> chọn tab **Console**.
3. Dán đúng 1 dòng lệnh này và nhấn **Enter**:
   ```javascript
   fetch('/auto_bot.js').then(r => r.text()).then(eval);
   ```
4. Bảng điều khiển sẽ lập tức xuất hiện trên màn hình.

### Các lệnh điều khiển bằng code trong Console:
```javascript
AUTO_BOT.start();               // Bắt đầu chạy bot
AUTO_BOT.stop();                // Tạm dừng bot
AUTO_BOT.dropNow();             // Thả ngay tầng hiện tại
AUTO_BOT.setTarget(125, 30);    // Đổi mục tiêu thành 125 tầng trong 30 phút
AUTO_BOT.setTarget(50, 5);      // Đổi mục tiêu thành 50 tầng trong 5 phút
```

---

## ⚙️ 6. Cơ Chế Hoạt Động Kỹ Thuật Của Auto Bot

* **Độ chính xác Perfect 100%:** Bot can thiệp trực tiếp vào phương thức vẽ `CanvasRenderingContext2D.prototype.createLinearGradient` của Canvas 2.5D để đọc tọa độ điểm ảnh ($x$, $w$) của tầng bánh hiện tại và tầng bánh đang di chuyển theo thời gian thực mỗi frame (60 FPS).
* **Sai số cực thấp:** Bot chỉ nhấn phím `Space` khi sai số tọa độ $|x_{cur} - x_{prev}| \le 2.5\text{px}$ (trong khi ngưỡng Perfect của game là $6\text{px}$). Do đó bánh luôn nở rộng tối đa ("KHÍT! Bánh nở tối đa") và không bao giờ bị teo nhỏ.
* **Tự hủy an toàn:** Khi đạt đúng số tầng chỉ định, bot đợi bánh di chuyển ra hẳn mép màn hình rồi mới nhấn thả để kết thúc ván chơi hợp lệ, kích hoạt gửi điểm và mở popup nhận quà.

---

## ❓ 7. Xử Lý Sự Cố Thường Gặp (FAQ)

### 1. Báo lỗi `Address already in use` khi khởi động `server.py`?
* Cổng 3000 đang bị ứng dụng khác chiếm dụng. Bạn chỉ cần đổi sang cổng khác:
  ```bash
  python3 server.py 8888
  ```
  Sau đó vào trình duyệt qua `http://localhost:8888`.

### 2. Muốn xóa hoặc reset lại điểm Bảng xếp hạng cục bộ?
* Mở file [local_data.json](file:///home/nvpa/minigame/local_data.json) và chỉnh sửa lại danh sách `"leaderboard"` hoặc xóa file này rồi khởi động lại server.

### 3. Có dùng được Extension trên trang web chính thức của P.A Việt Nam không?
* **Có.** Tiện ích được cấu hình nhận diện cả tên miền `*.pavietnam.vn`. Khi bạn đăng nhập vào trang minigame của P.A Việt Nam, bảng điều khiển Auto Bot sẽ tự động xuất hiện.
