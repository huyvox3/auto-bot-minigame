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

Bảng điều khiển **"🛡️ GOD MODE (BẤT TỬ)"** sẽ xuất hiện ở góc trên bên phải màn hình khi bạn mở trang minigame.

```text
┌──────────────────────────────────────────────┐
│  🛡️ GOD MODE (BẤT TỬ)          [ BẤT TỬ ON ] │
├──────────────────────────────────────────────┤
│  🎯 Mục tiêu (Tầng):      [ 200 ]            │
│  ⏱️ Thời gian chơi (Phút):[ 5   ]            │
├──────────────────────────────────────────────┤
│  [  🚀 Nhảy thẳng tới tầng 199             ] │
│  [  ☠️ Bấm để THUA & Nộp điểm              ] │
├──────────────────────────────────────────────┤
│  🍰 Đang ở tầng: 199 / 200                   │
│  ⏳ Thời gian: 04:30                         │
│  ⚡ Trạng thái: Đang ở tầng cuối!            │
├──────────────────────────────────────────────┤
│  [ Bắt đầu Auto ]         [  Thả 1 tầng  ]   │
└──────────────────────────────────────────────┘
```

### Các tính năng siêu cấp của God Mode:
1. **🛡️ Bất tử 100% (Không bao giờ thua):**
   * Trong suốt quá trình chơi, bánh di chuyển sẽ tự động bắt dính chuẩn xác vị trí **Perfect** với tầng dưới. Bánh luôn nở to cực đại `160px` và **không thể rơi hay lệch ra ngoài**, dù người chơi có bấm nhầm hay bấm bừa.
2. **🚀 Nhảy thẳng tới tầng cuối trong 0.01 giây:**
   * Chỉ cần bấm nút **"🚀 Nhảy thẳng tới tầng n - 1"** (ví dụ nếu đặt 200 thì nhảy lên tầng 199), bot sẽ lập tức dựng toàn bộ tháp bánh lên đến đỉnh, camera bay thẳng lên ngọn và đưa tầng 200 vào trạng thái đung đưa!
   * Bạn không cần phải chờ đợi xếp từng tầng một nữa!
3. **☠️ Chỉ thua khi người dùng bấm nút:**
   * Tầng cuối cùng sẽ đung đưa mãi mãi trên màn hình mà không bao giờ tự ý kết thúc.
   * Bạn có thể thoải mái chờ thời gian chơi tăng lên theo ý muốn (ví dụ 5 phút, 15 phút, 30 phút).
   * Khi thấy thời gian đã vừa ý, bạn chỉ cần bấm nút đỏ **"☠️ Bấm để THUA & Nộp điểm"**: Bot sẽ lập tức kết thúc ván, gửi điểm số lên máy chủ và mở popup nhận giải thưởng!

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
