/**
 * Extension Content Script - Auto Bot Xếp Bánh Đón Trăng
 * Hỗ trợ tùy chỉnh điểm số và thời gian tùy ý
 */

(function () {
    'use strict';

    function initWhenReady() {
        const cv = document.querySelector('#cv');
        const stage = document.querySelector('#stage');

        if (!cv || !stage) {
            setTimeout(initWhenReady, 1000);
            return;
        }

        setupAutoBot();
    }

    function setupAutoBot() {
        if (window.__AUTO_BOT_INSTALLED__) return;
        window.__AUTO_BOT_INSTALLED__ = true;

        // Đọc cấu hình đã lưu trong LocalStorage nếu có
        const savedScore = parseInt(localStorage.getItem('bot_target_score'), 10);
        const savedMins = parseFloat(localStorage.getItem('bot_total_mins'));

        const CONFIG = {
            TARGET_SCORE: !isNaN(savedScore) && savedScore > 0 ? savedScore : 125,
            TOTAL_MINUTES: !isNaN(savedMins) && savedMins > 0 ? savedMins : 30,
            PERFECT_TOLERANCE: 2.5
        };

        let isRunning = false;
        let startTime = 0;
        let lastDropTime = 0;
        let currentFloorDelay = (CONFIG.TOTAL_MINUTES * 60) / CONFIG.TARGET_SCORE;

        let lastPrev = null;
        let lastCur = null;

        // 1. Hook Canvas để bắt tọa độ bánh thời gian thực
        if (!window._origCreateGradient) {
            window._origCreateGradient = CanvasRenderingContext2D.prototype.createLinearGradient;
            CanvasRenderingContext2D.prototype.createLinearGradient = function (x0, y0, x1, y1) {
                if (Math.abs(this.globalAlpha - 0.97) < 0.01) {
                    lastCur = { x: x0, w: x1 - x0 };
                } else {
                    lastPrev = { x: x0, w: x1 - x0 };
                }
                return window._origCreateGradient.apply(this, arguments);
            };
        }

        function pressSpace() {
            window.dispatchEvent(new KeyboardEvent('keydown', {
                code: 'Space',
                key: ' ',
                keyCode: 32,
                which: 32,
                bubbles: true
            }));
        }

        function getCurrentScore() {
            const el = document.querySelector('#hTang');
            return el ? parseInt(el.textContent, 10) || 0 : 0;
        }

        function fmtTime(sec) {
            const m = Math.floor(sec / 60).toString().padStart(2, '0');
            const s = (sec % 60).toString().padStart(2, '0');
            return m + ':' + s;
        }

        // 2. Tạo bảng điều khiển HUD nổi trên màn hình
        let hud = document.getElementById('auto-bot-ext-hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'auto-bot-ext-hud';
            hud.style.cssText = `
                position: fixed; top: 15px; right: 15px; z-index: 2147483647;
                background: rgba(15, 23, 42, 0.95); border: 2px solid #f0a63c;
                border-radius: 12px; padding: 14px 18px; color: #fff;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                font-size: 13px; box-shadow: 0 10px 30px rgba(0,0,0,0.7);
                min-width: 280px; line-height: 1.5; backdrop-filter: blur(8px);
                user-select: none;
            `;
            document.body.appendChild(hud);
        }

        // Khởi tạo HTML cố định cho HUD
        hud.innerHTML = `
            <div style="font-weight:bold;color:#f0a63c;font-size:14px;margin-bottom:8px;border-bottom:1px solid #334155;padding-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
                <span>⚙️ AUTO BOT TÙY CHỈNH</span>
                <span id="hud-badge" style="font-size:11px;background:#64748b;color:#fff;padding:2px 8px;border-radius:10px;font-weight:bold;">
                    TẠM DỪNG
                </span>
            </div>

            <!-- Khung nhập điểm & thời gian -->
            <div style="background:rgba(30,41,59,0.7);border-radius:8px;padding:8px 10px;margin-bottom:10px;border:1px solid #334155;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                    <label style="color:#94a3b8;font-size:12px;">🎯 Mục tiêu (Tầng):</label>
                    <input id="input-target-score" type="number" min="1" max="500" value="${CONFIG.TARGET_SCORE}"
                        style="width:70px;background:#0f172a;border:1px solid #475569;border-radius:4px;color:#38bdf8;font-weight:bold;padding:3px 6px;text-align:center;font-size:13px;" />
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                    <label style="color:#94a3b8;font-size:12px;">⏱️ Thời gian (Phút):</label>
                    <input id="input-total-mins" type="number" min="0.1" max="180" step="0.5" value="${CONFIG.TOTAL_MINUTES}"
                        style="width:70px;background:#0f172a;border:1px solid #475569;border-radius:4px;color:#fbbf24;font-weight:bold;padding:3px 6px;text-align:center;font-size:13px;" />
                </div>
                <div style="font-size:11px;color:#94a3b8;margin-top:4px;text-align:right;">
                    Nhịp độ: <span id="hud-pace" style="color:#e2e8f0;font-weight:bold;">${((CONFIG.TOTAL_MINUTES * 60) / CONFIG.TARGET_SCORE).toFixed(1)}s/tầng</span>
                </div>
            </div>

            <!-- Thống kê trạng thái trực tiếp -->
            <div style="margin-bottom:10px;">
                <div>🍰 Đã xếp: <b id="hud-cur-score" style="color:#4ade80;font-size:16px;">0</b> / <span id="hud-max-score">${CONFIG.TARGET_SCORE}</span> tầng</div>
                <div>⏳ Thời gian: <b id="hud-elapsed">00:00</b> / <span id="hud-total-time">${fmtTime(CONFIG.TOTAL_MINUTES * 60)}</span></div>
                <div>⚡ Trạng thái: <span id="hud-status" style="color:#fbbf24;">Sẵn sàng</span></div>
            </div>

            <!-- Nút điều khiển -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                <button id="btnExtToggle" style="background:#10b981;color:#fff;border:none;padding:8px 10px;border-radius:6px;cursor:pointer;font-weight:bold;font-size:12px;">
                    Bắt đầu Auto
                </button>
                <button id="btnExtSkip" style="background:#3b82f6;color:#fff;border:none;padding:8px 10px;border-radius:6px;cursor:pointer;font-weight:bold;font-size:12px;">
                    Thả ngay
                </button>
            </div>

            <!-- Preset chọn nhanh -->
            <div style="margin-top:8px;display:flex;justify-content:space-between;border-top:1px solid #334155;padding-top:6px;font-size:11px;">
                <span style="color:#94a3b8;">Chọn nhanh:</span>
                <a id="preset-1" href="javascript:void(0)" style="color:#38bdf8;text-decoration:none;">125đ/30p</a>
                <a id="preset-2" href="javascript:void(0)" style="color:#38bdf8;text-decoration:none;">50đ/10p</a>
                <a id="preset-3" href="javascript:void(0)" style="color:#38bdf8;text-decoration:none;">Test 1p</a>
            </div>
        `;

        const inputScore = document.getElementById('input-target-score');
        const inputMins = document.getElementById('input-total-mins');
        const hudBadge = document.getElementById('hud-badge');
        const hudCurScore = document.getElementById('hud-cur-score');
        const hudMaxScore = document.getElementById('hud-max-score');
        const hudElapsed = document.getElementById('hud-elapsed');
        const hudTotalTime = document.getElementById('hud-total-time');
        const hudStatus = document.getElementById('hud-status');
        const hudPace = document.getElementById('hud-pace');
        const btnToggle = document.getElementById('btnExtToggle');
        const btnSkip = document.getElementById('btnExtSkip');

        function updateConfigFromInputs() {
            let sc = parseInt(inputScore.value, 10);
            let mi = parseFloat(inputMins.value);

            if (!isNaN(sc) && sc > 0) CONFIG.TARGET_SCORE = sc;
            if (!isNaN(mi) && mi > 0) CONFIG.TOTAL_MINUTES = mi;

            localStorage.setItem('bot_target_score', CONFIG.TARGET_SCORE);
            localStorage.setItem('bot_total_mins', CONFIG.TOTAL_MINUTES);

            currentFloorDelay = (CONFIG.TOTAL_MINUTES * 60) / CONFIG.TARGET_SCORE;
            hudMaxScore.textContent = CONFIG.TARGET_SCORE;
            hudTotalTime.textContent = fmtTime(CONFIG.TOTAL_MINUTES * 60);
            hudPace.textContent = currentFloorDelay.toFixed(1) + 's/tầng';
        }

        inputScore.oninput = updateConfigFromInputs;
        inputMins.oninput = updateConfigFromInputs;

        document.getElementById('preset-1').onclick = () => {
            inputScore.value = 125;
            inputMins.value = 30;
            updateConfigFromInputs();
        };
        document.getElementById('preset-2').onclick = () => {
            inputScore.value = 50;
            inputMins.value = 10;
            updateConfigFromInputs();
        };
        document.getElementById('preset-3').onclick = () => {
            inputScore.value = 125;
            inputMins.value = 1;
            updateConfigFromInputs();
        };

        btnSkip.onclick = () => { currentFloorDelay = 0; };

        btnToggle.onclick = () => {
            if (isRunning) {
                stopAuto();
            } else {
                startAuto();
            }
        };

        function startAuto() {
            updateConfigFromInputs();
            isRunning = true;
            if (startTime === 0) startTime = Date.now();
            lastDropTime = Date.now();
            currentFloorDelay = (CONFIG.TOTAL_MINUTES * 60) / CONFIG.TARGET_SCORE;

            hudBadge.textContent = 'ĐANG CHẠY';
            hudBadge.style.background = '#10b981';
            btnToggle.textContent = 'Tạm dừng';
            btnToggle.style.background = '#ef4444';

            // Tự bấm bắt đầu nếu overlay start đang mở
            const btnStart = document.querySelector('#btnStart');
            if (btnStart && !btnStart.disabled && document.querySelector('#ovlStart.on')) {
                btnStart.click();
            }

            requestAnimationFrame(botLoop);
        }

        function stopAuto() {
            isRunning = false;
            hudBadge.textContent = 'TẠM DỪNG';
            hudBadge.style.background = '#64748b';
            btnToggle.textContent = 'Bắt đầu Auto';
            btnToggle.style.background = '#10b981';
            hudStatus.innerHTML = '<span style="color:#fbbf24;">Đã tạm dừng</span>';
        }

        function botLoop() {
            if (!isRunning) return;

            const currentScore = getCurrentScore();
            const now = Date.now();
            const elapsedTotal = startTime > 0 ? Math.floor((now - startTime) / 1000) : 0;
            const elapsedFloor = lastDropTime > 0 ? (now - lastDropTime) / 1000 : 0;
            const remainWait = Math.max(0, currentFloorDelay - elapsedFloor);

            hudCurScore.textContent = currentScore;
            hudElapsed.textContent = fmtTime(elapsedTotal);

            // Kiểm tra hoàn thành mục tiêu
            if (currentScore >= CONFIG.TARGET_SCORE) {
                if (lastCur && lastPrev && Math.abs(lastCur.x - lastPrev.x) > lastPrev.w * 0.9) {
                    pressSpace();
                    isRunning = false;
                    hudBadge.textContent = 'HOÀN THÀNH';
                    hudBadge.style.background = '#3b82f6';
                    btnToggle.textContent = 'Bắt đầu lại';
                    btnToggle.style.background = '#10b981';
                    hudStatus.innerHTML = `<span style="color:#4ade80;font-weight:bold;">🎉 Đã đạt ${CONFIG.TARGET_SCORE} tầng!</span>`;
                    return;
                }
                requestAnimationFrame(botLoop);
                return;
            }

            if (remainWait > 0) {
                hudStatus.innerHTML = `<span style="color:#fbbf24;">Lắc bánh (${remainWait.toFixed(1)}s)</span>`;
            } else {
                hudStatus.innerHTML = `<span style="color:#4ade80;font-weight:bold;">CANH PERFECT...</span>`;
            }

            // Canh chuẩn Perfect khi đã đủ thời gian chờ
            if (remainWait <= 0 && lastCur && lastPrev) {
                const dx = Math.abs(lastCur.x - lastPrev.x);
                if (dx <= CONFIG.PERFECT_TOLERANCE) {
                    pressSpace();
                    lastDropTime = Date.now();
                    const baseDelay = (CONFIG.TOTAL_MINUTES * 60) / CONFIG.TARGET_SCORE;
                    currentFloorDelay = baseDelay + (Math.random() * 2 - 1);
                }
            }

            requestAnimationFrame(botLoop);
        }

        window.AUTO_BOT = {
            start: startAuto,
            stop: stopAuto,
            setTarget: (score, minutes) => {
                inputScore.value = score;
                inputMins.value = minutes;
                updateConfigFromInputs();
            }
        };
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initWhenReady();
    } else {
        document.addEventListener('DOMContentLoaded', initWhenReady);
    }
})();
