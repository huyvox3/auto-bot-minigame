import json
import os
import sys
import time
import urllib.request
import urllib.error
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR = os.path.join(BASE_DIR, '_cache')
DATA_FILE = os.path.join(BASE_DIR, 'local_data.json')

# Đảm bảo thư mục cache tồn tại
os.makedirs(CACHE_DIR, exist_ok=True)

# Khởi tạo hoặc đọc dữ liệu người chơi cục bộ
def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "user_token": "local_user_6868",
        "session_signing_token": "local_session_token",
        "remain_turn": 10,
        "daily_high_score": 0,
        "name": "Local Player",
        "email": "player@localhost.dev",
        "phone": "0988888888",
        "leaderboard": [
            {"email": "player@localhost.dev", "score": 35, "is_me": True, "has_won_daily": False, "won_date": ""},
            {"email": "hoangmai***@gmail.com", "score": 30, "is_me": False, "has_won_daily": False, "won_date": ""},
            {"email": "trungthu***@pavietnam.vn", "score": 25, "is_me": False, "has_won_daily": False, "won_date": ""}
        ],
        "winners": [
            {"date": "22/09/2026", "email": "nguyenvana***@gmail.com", "score": 52, "gift": "Voucher Tên Miền PA", "is_grand": True}
        ]
    }

local_state = load_data()

def save_data():
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(local_state, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("Lỗi lưu local_data:", e)

class MinigameServer(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # 1. Trang chủ -> mini-game-xep-banh-don-trang.html
        if path in ('/', '/index.html', '/mini-game-xep-banh-don-trang.html'):
            html_file = os.path.join(BASE_DIR, 'mini-game-xep-banh-don-trang.html')
            if os.path.exists(html_file):
                with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                # Tự động mở rộng khoảng thời gian sự kiện để game luôn chạy được bất kỳ lúc nào
                content = content.replace("from_date: '2026-09-22'", "from_date: '2020-01-01'")
                content = content.replace("to_date: '2026-09-29'", "to_date: '2099-12-31'")
                content = content.replace("</body>", '<script src="/auto_bot.js"></script></body>')
                data = content.encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return

        # 2. Vô hiệu hoá anti.js để mở F12/Console thoải mái không bị debugger hay reload
        if path.endswith('anti.js'):
            content = b"console.log('[Local Dev] anti.js has been disabled.');"
            self.send_response(200)
            self.send_header('Content-Type', 'application/javascript')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        # 3. Xử lý đường dẫn script nội bộ /js/minigame/*.js
        if path.startswith('/js/minigame/'):
            filename = os.path.basename(path)
            local_file = os.path.join(BASE_DIR, filename)
            if os.path.exists(local_file):
                self.serve_file(local_file, 'application/javascript')
                return

        # 3. API Bảng xếp hạng & Người thắng giải
        if path.startswith('/vn/minigame.html') or path.startswith('/ajax/minigame'):
            query = parse_qs(parsed.query)
            step = query.get('step', [''])[0]
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()

            if step in ('ranking', 'ranking-grand'):
                # Sắp xếp BXH theo điểm giảm dần
                sorted_ranks = sorted(local_state["leaderboard"], key=lambda x: x.get("score", 0), reverse=True)
                resp = {"success": True, "msg": "OK", "data": sorted_ranks}
                self.wfile.write(json.dumps(resp).encode('utf-8'))
                return
            elif step == 'winners':
                resp = {"success": True, "msg": "OK", "data": local_state.get("winners", [])}
                self.wfile.write(json.dumps(resp).encode('utf-8'))
                return

        # 4. Kiểm tra file tĩnh có sẵn trong thư mục gốc
        local_direct = os.path.join(BASE_DIR, path.lstrip('/'))
        if os.path.isfile(local_direct):
            return super().do_GET()

        # 5. Fallback/Proxy lấy tài nguyên giao diện từ CDN/Website gốc (CSS, Images, Fonts, Libs)
        self.proxy_remote_asset(path)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith('/vn/minigame.html') or path.startswith('/ajax/minigame'):
            query = parse_qs(parsed.query)
            step = query.get('step', [''])[0]

            content_length = int(self.headers.get('Content-Length', 0))
            body = {}
            if content_length > 0:
                try:
                    raw_body = self.rfile.read(content_length).decode('utf-8')
                    body = json.loads(raw_body)
                except Exception:
                    pass

            res_data = {"success": True, "msg": "Thành công", "data": {}}

            if step == 'init':
                res_data["data"] = {
                    "user_token": local_state["user_token"],
                    "session_signing_token": local_state["session_signing_token"],
                    "remain_turn": local_state["remain_turn"],
                    "daily_high_score": local_state["daily_high_score"],
                    "name": local_state["name"],
                    "email": local_state["email"],
                    "phone": local_state["phone"]
                }
            elif step == 'play':
                action = body.get('action')
                if action == 'start':
                    if local_state["remain_turn"] > 0:
                        local_state["remain_turn"] -= 1
                    play_token = f"play_{int(time.time()*1000)}"
                    res_data["data"] = {
                        "play_token": play_token,
                        "remain_turn": local_state["remain_turn"]
                    }
                    save_data()
                elif action == 'finish':
                    score = int(body.get('score', 0))
                    if score > local_state["daily_high_score"]:
                        local_state["daily_high_score"] = score

                    # Cập nhật điểm của bạn vào BXH
                    user_found = False
                    for r in local_state["leaderboard"]:
                        if r.get("is_me"):
                            if score > r.get("score", 0):
                                r["score"] = score
                            user_found = True
                            break
                    if not user_found:
                        local_state["leaderboard"].append({
                            "email": local_state["email"],
                            "score": score,
                            "is_me": True,
                            "has_won_daily": False,
                            "won_date": ""
                        })

                    res_data["data"] = {
                        "play_id": int(time.time()),
                        "score": score,
                        "daily_high_score": local_state["daily_high_score"]
                    }
                    save_data()

            elif step == 'claim':
                name = body.get('name') or local_state["name"]
                email = body.get('email') or local_state["email"]
                voice = body.get('voice') or local_state["phone"]
                local_state["name"] = name
                local_state["email"] = email
                local_state["phone"] = voice
                res_data["msg"] = "Ghi nhận thành tích thành công!"
                save_data()

            elif step == 'share':
                # Cộng thêm 5 lượt khi chia sẻ
                local_state["remain_turn"] += 5
                res_data["msg"] = "Đã cộng thêm 5 lượt chơi!"
                res_data["data"] = {
                    "remain_turn": local_state["remain_turn"]
                }
                save_data()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(res_data, ensure_ascii=False).encode('utf-8'))
            return

        self.send_error(404, "Not Found")

    def serve_file(self, filepath, content_type):
        try:
            with open(filepath, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Error: {e}")

    def proxy_remote_asset(self, path):
        """Tải và lưu đệm tài nguyên tĩnh (hình ảnh, css, lib) từ máy chủ gốc"""
        cache_path = os.path.join(CACHE_DIR, path.lstrip('/'))
        if os.path.exists(cache_path):
            return self.serve_file(cache_path, self.guess_type(cache_path))

        # Tải từ website gốc
        remote_url = f"https://www.pavietnam.vn{path}"
        try:
            req = urllib.request.Request(remote_url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.pavietnam.vn/'
            })
            with urllib.request.urlopen(req, timeout=5) as resp:
                content = resp.read()
                content_type = resp.headers.get('Content-Type', self.guess_type(path))
                
                # Lưu vào cache để lần sau tải tức thì
                os.makedirs(os.path.dirname(cache_path), exist_ok=True)
                with open(cache_path, 'wb') as f:
                    f.write(content)

                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
        except Exception:
            self.send_error(404, "Asset Not Found")

if __name__ == '__main__':
    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass

    server = None
    for p in [port, 3001, 8888, 8000]:
        try:
            server = HTTPServer(('0.0.0.0', p), MinigameServer)
            port = p
            break
        except OSError:
            continue

    if not server:
        print("Không thể tìm cổng trống để khởi động server.")
        sys.exit(1)

    print("=" * 60)
    print(f" Mini Game Xếp Bánh Đón Trăng - Local Server")
    print(f" Đang chạy tại: http://localhost:{port}")
    print(f" Mở trình duyệt và truy cập: http://localhost:{port}")
    print(" Nhấn Ctrl + C để dừng server")
    print("=" * 60)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nĐã dừng server.")
