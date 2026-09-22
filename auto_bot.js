/**
 * Extension Content Script - Auto Bot Xếp Bánh Đón Trăng
 * Đã khắc phục triệt để lỗi rơi ở tầng 30:
 * - Nguyên nhân: Ở tầng 30, hiệu ứng gió (winds) xuất hiện liên tục và gọi createLinearGradient làm sai lệch tọa độ tầng trước.
 * - Giải pháp: Sử dụng Dual-Tracking (Ưu tiên đọc trực tiếp từ Engine nội bộ, dự phòng bằng Hook Canvas Ellipse chuyên biệt cho bóng bánh).
 * - Chống Double-drop: Đảm bảo mỗi tầng chỉ nhấn phím 1 lần duy nhất.
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

        const savedScore = parseInt(localStorage.getItem('bot_target_score'), 10);
        const savedMins = parseFloat(localStorage.getItem('bot_total_mins'));

        const CONFIG = {
            TARGET_SCORE: !isNaN(savedScore) && savedScore > 0 ? savedScore : 125,
            TOTAL_MINUTES: !isNaN(savedMins) && savedMins > 0 ? savedMins : 30,
            PERFECT_TOLERANCE: 4.5 // Game quy định Perfect là <= 6px
        };

        let isRunning = false;
        let startTime = 0;
        let forceDropNow = false;
        let lastDroppedScore = -1;

        let realCur = null;
        let realPrev = null;

        // Hook Canvas Ellipse chuyên biệt: Chỉ nhận bóng bánh (globalAlpha 0.24 & 0.2328), không bị gió làm nhiễu
        if (!window._origEllipse) {
            window._origEllipse = CanvasRenderingContext2D.prototype.ellipse;
            CanvasRenderingContext2D.prototype.ellipse = function (cx, cy, rx, ry, rot, sa, ea) {
                if (Math.abs(this.globalAlpha - 0.2328) < 0.005) {
                    realCur = { cx: cx, rx: rx };
                } else if (Math.abs(this.globalAlpha - 0.24) < 0.005) {
                    realPrev = { cx: cx, rx: rx };
                }
                return window._origEllipse.apply(this, arguments);
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

        function getPositions() {
            // 1. Ưu tiên đọc trực tiếp từ Engine game nếu có
            if (window.__MINIGAME_CORE__) {
                const c = window.__MINIGAME_CORE__.getCur();
                const p = window.__MINIGAME_CORE__.getPrev();
                if (c && p) {
                    return {
                        dx: Math.abs(c.x - p.x),
                        curX: c.x,
                        prevX: p.x,
                        w: p.w
                    };
                }
            }
            // 2. Dự phòng bằng Hook Canvas Ellipse
            if (realCur && realPrev) {
                return {
                    dx: Math.abs(realCur.cx - realPrev.cx),
                    curX: realCur.cx,
                    prevX: realPrev.cx,
                    w: realPrev.rx * 2
                };
            }
            return null;
        }

        function fmtTime(sec) {
            const m = Math.floor(sec / 60).toString().padStart(2, '0');
            const s = (sec % 60).toString().padStart(2, '0');
            return m + ':' + s;
        }

        // Tạo giao diện HUD
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
                min-width: 285px; line-height: 1.5; backdrop-filter: blur(8px);
                user-select: none;
            `;
            document.body.appendChild(hud);
        }

        hud.innerHTML = `
            <div style="font-weight:bold;color:#f0a63c;font-size:14px;margin-bottom:8px;border-bottom:1px solid #334155;padding-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
                <span>⚡ AUTO BOT SPEEDRUN</span>
                <span id="hud-badge" style="font-size:11px;background:#64748b;color:#fff;padding:2px 8px;border-radius:10px;font-weight:bold;">
                    TẠM DỪNG
                </span>
            </div>

            <div style="background:rgba(30,41,59,0.7);border-radius:8px;padding:8px 10px;margin-bottom:10px;border:1px solid #334155;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                    <label style="color:#94a3b8;font-size:12px;">🎯 Mục tiêu (Tầng):</label>
                    <input id="input-target-score" type="number" min="1" max="500" value="${CONFIG.TARGET_SCORE}"
                        style="width:70px;background:#0f172a;border:1px solid #475569;border-radius:4px;color:#38bdf8;font-weight:bold;padding:3px 6px;text-align:center;font-size:13px;" />
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                    <label style="color:#94a3b8;font-size:12px;">⏱️ Tổng giờ chơi (Phút):</label>
                    <input id="input-total-mins" type="number" min="0.1" max="180" step="0.5" value="${CONFIG.TOTAL_MINUTES}"
                        style="width:70px;background:#0f172a;border:1px solid #475569;border-radius:4px;color:#fbbf24;font-weight:bold;padding:3px 6px;text-align:center;font-size:13px;" />
                </div>
                <div style="font-size:11px;color:#cbd5e1;margin-top:6px;line-height:1.4;background:rgba(15,23,42,0.6);padding:4px 6px;border-radius:4px;">
                    💡 Tầng 1 → <span id="hud-sub-target">${CONFIG.TARGET_SCORE - 1}</span>: Thả tốc độ cao.<br>
                    💡 Tầng <span id="hud-last-floor">${CONFIG.TARGET_SCORE}</span>: Chờ đủ <span id="hud-wait-mins">${CONFIG.TOTAL_MINUTES}</span> phút mới thả.
                </div>
            </div>

            <div style="margin-bottom:10px;">
                <div>🍰 Đã xếp: <b id="hud-cur-score" style="color:#4ade80;font-size:16px;">0</b> / <span id="hud-max-score">${CONFIG.TARGET_SCORE}</span> tầng</div>
                <div>⏳ Thời gian: <b id="hud-elapsed">00:00</b> / <span id="hud-total-time">${fmtTime(CONFIG.TOTAL_MINUTES * 60)}</span></div>
                <div style="margin-top:4px;">⚡ Tiến độ: <span id="hud-status" style="color:#fbbf24;">Sẵn sàng</span></div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                <button id="btnExtToggle" style="background:#10b981;color:#fff;border:none;padding:8px 10px;border-radius:6px;cursor:pointer;font-weight:bold;font-size:12px;">
                    Bắt đầu Auto
                </button>
                <button id="btnExtSkip" style="background:#3b82f6;color:#fff;border:none;padding:8px 10px;border-radius:6px;cursor:pointer;font-weight:bold;font-size:12px;">
                    Thả ngay tầng này
                </button>
            </div>

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
        const hudSubTarget = document.getElementById('hud-sub-target');
        const hudLastFloor = document.getElementById('hud-last-floor');
        const hudWaitMins = document.getElementById('hud-wait-mins');
        const btnToggle = document.getElementById('btnExtToggle');
        const btnSkip = document.getElementById('btnExtSkip');

        function updateConfigFromInputs() {
            let sc = parseInt(inputScore.value, 10);
            let mi = parseFloat(inputMins.value);

            if (!isNaN(sc) && sc > 0) CONFIG.TARGET_SCORE = sc;
            if (!isNaN(mi) && mi > 0) CONFIG.TOTAL_MINUTES = mi;

            localStorage.setItem('bot_target_score', CONFIG.TARGET_SCORE);
            localStorage.setItem('bot_total_mins', CONFIG.TOTAL_MINUTES);

            hudMaxScore.textContent = CONFIG.TARGET_SCORE;
            hudSubTarget.textContent = Math.max(0, CONFIG.TARGET_SCORE - 1);
            hudLastFloor.textContent = CONFIG.TARGET_SCORE;
            hudWaitMins.textContent = CONFIG.TOTAL_MINUTES;
            hudTotalTime.textContent = fmtTime(CONFIG.TOTAL_MINUTES * 60);
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

        btnSkip.onclick = () => { forceDropNow = true; };

        btnToggle.onclick = () => {
            if (isRunning) stopAuto();
            else startAuto();
        };

        function startAuto() {
            updateConfigFromInputs();
            isRunning = true;
            if (startTime === 0) startTime = Date.now();
            forceDropNow = false;
            lastDroppedScore = -1;

            hudBadge.textContent = 'ĐANG CHẠY';
            hudBadge.style.background = '#10b981';
            btnToggle.textContent = 'Tạm dừng';
            btnToggle.style.background = '#ef4444';

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
            const totalSec = CONFIG.TOTAL_MINUTES * 60;
            const elapsedTotal = startTime > 0 ? Math.floor((now - startTime) / 1000) : 0;
            const remainTotalSec = Math.max(0, totalSec - elapsedTotal);

            hudCurScore.textContent = currentScore;
            hudElapsed.textContent = fmtTime(elapsedTotal);

            // 1. ĐÃ ĐẠT ĐỦ ĐIỂM MỤC TIÊU -> Thả trượt có chủ đích để game kết thúc và nộp kết quả
            if (currentScore >= CONFIG.TARGET_SCORE) {
                const pos = getPositions();
                if (pos && pos.dx > pos.w * 0.85) {
                    pressSpace();
                    isRunning = false;
                    hudBadge.textContent = 'HOÀN THÀNH';
                    hudBadge.style.background = '#3b82f6';
                    btnToggle.textContent = 'Bắt đầu lại';
                    btnToggle.style.background = '#10b981';
                    hudStatus.innerHTML = `<span style="color:#4ade80;font-weight:bold;">🎉 Đã đạt ${CONFIG.TARGET_SCORE} tầng (${fmtTime(elapsedTotal)})!</span>`;
                    return;
                }
                requestAnimationFrame(botLoop);
                return;
            }

            // 2. CHỐNG DOUBLE-DROP: Đã thả cho tầng này rồi thì tuyệt đối chờ tầng mới xuất hiện
            if (lastDroppedScore === currentScore) {
                requestAnimationFrame(botLoop);
                return;
            }

            // 3. TẦNG CUỐI CÙNG (currentScore === CONFIG.TARGET_SCORE - 1):
            // Chờ cho đến khi đủ tổng thời gian chơi đã cài đặt
            const isLastFloor = (currentScore === CONFIG.TARGET_SCORE - 1);

            if (isLastFloor) {
                if (remainTotalSec > 0 && !forceDropNow) {
                    hudStatus.innerHTML = `<span style="color:#fbbf24;font-weight:bold;">⏳ Tầng ${CONFIG.TARGET_SCORE}: Chờ đủ giờ (${fmtTime(remainTotalSec)})...</span>`;
                    requestAnimationFrame(botLoop);
                    return;
                }
                hudStatus.innerHTML = `<span style="color:#4ade80;font-weight:bold;">🎯 ĐỦ GIỜ! Đang canh thả tầng ${CONFIG.TARGET_SCORE}...</span>`;
            } else {
                hudStatus.innerHTML = `<span style="color:#38bdf8;font-weight:bold;">⚡ Tốc độ: Tầng ${currentScore + 1}/${CONFIG.TARGET_SCORE} (Canh Perfect...)</span>`;
            }

            // 4. CANH THẢ PERFECT
            const pos = getPositions();
            if (pos && pos.dx <= CONFIG.PERFECT_TOLERANCE) {
                lastDroppedScore = currentScore; // Khóa ngay lập tức, không thả 2 lần cùng 1 tầng
                pressSpace();
                forceDropNow = false;
            }

            requestAnimationFrame(botLoop);
        }

        window.AUTO_BOT = {
            start: startAuto,
            stop: stopAuto,
            dropNow: () => { forceDropNow = true; },
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
