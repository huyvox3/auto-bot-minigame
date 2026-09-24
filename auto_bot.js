/**
 * Extension Content Script - Auto Bot Xếp Bánh Đón Trăng (Turbo Fast-Stack cho Production & Local)
 * Hoạt động hoàn hảo 100% trên cả trang web thật (Production) lẫn Localhost:
 * 1. Turbo Fast-Stack: Tự động thả Perfect siêu tốc (mỗi 0.3s một tầng) leo thẳng lên tầng n - 1 mà không thể thua.
 * 2. Tầng cuối n: Dừng lại đung đưa an toàn chờ người dùng xem đồng hồ hoặc bấm nút nộp.
 * 3. Nút "☠️ Bấm để THUA & Nộp điểm": Canh chuẩn tầng cuối rồi chủ động thả lệch để nộp điểm hợp lệ lên máy chủ.
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
            TARGET_SCORE: !isNaN(savedScore) && savedScore > 0 ? savedScore : 200,
            TOTAL_MINUTES: !isNaN(savedMins) && savedMins > 0 ? savedMins : 5,
            PERFECT_TOLERANCE: 5.2 // Chuẩn Perfect của game là <= 6.0px
        };

        let isRunning = false;
        let isFinishing = false;
        let startTime = 0;
        let lastDroppedScore = -1;

        let realCur = null;
        let realPrev = null;

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

        // HÀM CHỦ ĐỘNG KẾT THÚC VÀ NỘP ĐIỂM
        function finishAndSubmitScore() {
            isFinishing = true;
            const hudStatus = document.getElementById('hud-status');
            if (hudStatus) {
                hudStatus.innerHTML = `<span style="color:#fbbf24;font-weight:bold;">Đang hoàn tất tầng cuối & nộp điểm...</span>`;
            }
        }

        // XỬ LÝ THẢ BÁNH TỰ ĐỘNG THEO TỪNG FRAME
        function tryDrop(curCenterX, prevCenterX, cakeWidth) {
            if (!isRunning) return;

            const currentScore = getCurrentScore();
            if (lastDroppedScore === currentScore) return;

            const dx = Math.abs(curCenterX - prevCenterX);

            // GIAI ĐOẠN NỘP ĐIỂM KHI NGƯỜI DÙNG BẤM NÚT
            if (isFinishing) {
                // Nếu đang ở tầng n - 1: Phải thả Perfect để đạt đúng tầng n
                if (currentScore < CONFIG.TARGET_SCORE) {
                    if (dx <= CONFIG.PERFECT_TOLERANCE) {
                        lastDroppedScore = currentScore;
                        pressSpace();
                    }
                    return;
                }

                // Khi đã đạt đúng điểm mục tiêu: Thả trượt ra ngoài để game kết thúc hợp lệ
                if (dx > cakeWidth * 0.8) {
                    pressSpace();
                    isRunning = false;
                    isFinishing = false;
                    const hudBadge = document.getElementById('hud-badge');
                    if (hudBadge) {
                        hudBadge.textContent = 'ĐÃ NỘP ĐIỂM';
                        hudBadge.style.background = '#8b5cf6';
                    }
                    const hudStatus = document.getElementById('hud-status');
                    if (hudStatus) {
                        const elapsed = startTime > 0 ? Math.floor((Date.now() - startTime) / 1000) : 0;
                        hudStatus.innerHTML = `<span style="color:#a78bfa;font-weight:bold;">🎉 Đã hoàn thành ${CONFIG.TARGET_SCORE} tầng (${fmtTime(elapsed)})!</span>`;
                    }
                }
                return;
            }

            // GIAI ĐOẠN ĐANG LEO THÁP:
            // Chỉ thả tự động từ tầng 0 đến n - 2. Tới tầng n - 1 thì DỪNG LẠI đung đưa an toàn!
            if (currentScore >= CONFIG.TARGET_SCORE - 1) {
                return; // Dừng lại ở tầng cuối, không thả nữa
            }

            // Canh chuẩn Perfect để thả (tuyệt đối không thả bừa)
            if (dx <= CONFIG.PERFECT_TOLERANCE) {
                lastDroppedScore = currentScore;
                pressSpace();
            }
        }

        // HOOK CANVAS ELLIPSE CHO BÁNH (Kháng gió và hiệu ứng nền)
        if (!window._origEllipse) {
            window._origEllipse = CanvasRenderingContext2D.prototype.ellipse;
            CanvasRenderingContext2D.prototype.ellipse = function (cx, cy, rx, ry, rot, sa, ea) {
                if (Math.abs(this.globalAlpha - 0.2328) < 0.005) {
                    realCur = { cx: cx, rx: rx };
                    if (realPrev) {
                        tryDrop(cx, realPrev.cx, realPrev.rx * 2);
                    }
                } else if (Math.abs(this.globalAlpha - 0.24) < 0.005) {
                    realPrev = { cx: cx, rx: rx };
                }
                return window._origEllipse.apply(this, arguments);
            };
        }

        // TẠO GIAO DIỆN HUD NỔI TRÊN MÀN HÌNH
        let hud = document.getElementById('auto-bot-ext-hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'auto-bot-ext-hud';
            hud.style.cssText = `
                position: fixed; top: 15px; right: 15px; z-index: 2147483647;
                background: rgba(15, 23, 42, 0.96); border: 2px solid #8b5cf6;
                border-radius: 14px; padding: 16px 18px; color: #fff;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                font-size: 13px; box-shadow: 0 12px 35px rgba(0,0,0,0.75);
                min-width: 295px; line-height: 1.5; backdrop-filter: blur(10px);
                user-select: none;
            `;
            document.body.appendChild(hud);
        }

        hud.innerHTML = `
            <div style="font-weight:bold;color:#c084fc;font-size:14px;margin-bottom:8px;border-bottom:1px solid #334155;padding-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
                <span>⚡ TURBO AUTO BOT (PROD & LOCAL)</span>
                <span id="hud-badge" style="font-size:11px;background:#64748b;color:#fff;padding:2px 8px;border-radius:10px;font-weight:bold;">
                    TẠM DỪNG
                </span>
            </div>

            <!-- Cấu hình điểm -->
            <div style="background:rgba(30,41,59,0.7);border-radius:8px;padding:8px 10px;margin-bottom:10px;border:1px solid #334155;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                    <label style="color:#94a3b8;font-size:12px;">🎯 Mục tiêu (Tầng):</label>
                    <input id="input-target-score" type="number" min="1" max="1000" value="${CONFIG.TARGET_SCORE}"
                        style="width:75px;background:#0f172a;border:1px solid #64748b;border-radius:4px;color:#38bdf8;font-weight:bold;padding:3px 6px;text-align:center;font-size:13px;" />
                </div>
                <div style="font-size:11px;color:#cbd5e1;line-height:1.4;">
                    ⚡ Tầng 0 → <span id="hud-sub-target">${CONFIG.TARGET_SCORE - 1}</span>: Tự động xếp Perfect siêu tốc.<br>
                    ⏳ Tầng <span id="hud-last-floor">${CONFIG.TARGET_SCORE}</span>: Tự dừng đung đưa chờ bạn nộp.
                </div>
            </div>

            <!-- NÚT ĐIỀU KHIỂN CHÍNH -->
            <div style="margin-bottom:10px;display:flex;flex-direction:column;gap:6px;">
                <button id="btnExtToggle" style="background:linear-gradient(135deg, #10b981, #059669);color:#fff;border:none;padding:10px 12px;border-radius:8px;cursor:pointer;font-weight:bold;font-size:13px;box-shadow:0 4px 12px rgba(16,185,129,0.35);">
                    🚀 Bắt đầu Turbo Leo Tháp
                </button>
                <button id="btnSubmitScore" style="background:linear-gradient(135deg, #ef4444, #dc2626);color:#fff;border:none;padding:10px 12px;border-radius:8px;cursor:pointer;font-weight:bold;font-size:13px;box-shadow:0 4px 12px rgba(239,68,68,0.35);">
                    ☠️ Bấm để THUA & Nộp điểm
                </button>
            </div>

            <!-- Thống kê trạng thái -->
            <div style="margin-bottom:10px;background:rgba(15,23,42,0.6);padding:6px 10px;border-radius:6px;border:1px solid #1e293b;">
                <div>🍰 Đang ở tầng: <b id="hud-cur-score" style="color:#4ade80;font-size:16px;">0</b> / <span id="hud-max-score">${CONFIG.TARGET_SCORE}</span></div>
                <div>⏳ Thời gian chơi: <b id="hud-elapsed">00:00</b></div>
                <div style="margin-top:3px;">⚡ Trạng thái: <span id="hud-status" style="color:#c084fc;">Sẵn sàng</span></div>
            </div>

            <!-- Nút chọn nhanh -->
            <div style="display:flex;justify-content:space-between;border-top:1px solid #334155;padding-top:6px;font-size:11px;">
                <span style="color:#94a3b8;">Chọn nhanh:</span>
                <a id="preset-1" href="javascript:void(0)" style="color:#38bdf8;text-decoration:none;">125 tầng</a>
                <a id="preset-2" href="javascript:void(0)" style="color:#38bdf8;text-decoration:none;">200 tầng</a>
                <a id="preset-3" href="javascript:void(0)" style="color:#38bdf8;text-decoration:none;">50 tầng</a>
            </div>
        `;

        const inputScore = document.getElementById('input-target-score');
        const btnToggle = document.getElementById('btnExtToggle');
        const btnSubmit = document.getElementById('btnSubmitScore');
        const hudBadge = document.getElementById('hud-badge');
        const hudCurScore = document.getElementById('hud-cur-score');
        const hudMaxScore = document.getElementById('hud-max-score');
        const hudElapsed = document.getElementById('hud-elapsed');
        const hudStatus = document.getElementById('hud-status');
        const hudSubTarget = document.getElementById('hud-sub-target');
        const hudLastFloor = document.getElementById('hud-last-floor');

        function updateConfigFromInputs() {
            let sc = parseInt(inputScore.value, 10);
            if (!isNaN(sc) && sc > 0) CONFIG.TARGET_SCORE = sc;

            localStorage.setItem('bot_target_score', CONFIG.TARGET_SCORE);
            hudMaxScore.textContent = CONFIG.TARGET_SCORE;
            hudSubTarget.textContent = Math.max(0, CONFIG.TARGET_SCORE - 1);
            hudLastFloor.textContent = CONFIG.TARGET_SCORE;
        }

        inputScore.oninput = updateConfigFromInputs;

        document.getElementById('preset-1').onclick = () => { inputScore.value = 125; updateConfigFromInputs(); };
        document.getElementById('preset-2').onclick = () => { inputScore.value = 200; updateConfigFromInputs(); };
        document.getElementById('preset-3').onclick = () => { inputScore.value = 50; updateConfigFromInputs(); };

        btnSubmit.onclick = () => {
            finishAndSubmitScore();
        };

        btnToggle.onclick = () => {
            isRunning = !isRunning;
            if (isRunning) {
                if (startTime === 0) startTime = Date.now();
                isFinishing = false;
                hudBadge.textContent = 'ĐANG LEO THÁP';
                hudBadge.style.background = '#10b981';
                btnToggle.textContent = 'Tạm dừng';
                btnToggle.style.background = '#ef4444';

                // Tự bấm nút Start của game nếu chưa chơi
                const btnStart = document.querySelector('#btnStart');
                if (btnStart && !btnStart.disabled && document.querySelector('#ovlStart.on')) {
                    btnStart.click();
                }
            } else {
                hudBadge.textContent = 'TẠM DỪNG';
                hudBadge.style.background = '#64748b';
                btnToggle.textContent = 'Tiếp tục Turbo';
                btnToggle.style.background = '#10b981';
            }
        };

        function renderStatus() {
            const currentScore = getCurrentScore();
            hudCurScore.textContent = currentScore;
            const elapsed = startTime > 0 ? Math.floor((Date.now() - startTime) / 1000) : 0;
            hudElapsed.textContent = fmtTime(elapsed);

            if (isFinishing) {
                hudStatus.innerHTML = `<span style="color:#fbbf24;font-weight:bold;">Đang hoàn tất nộp điểm...</span>`;
            } else if (currentScore >= CONFIG.TARGET_SCORE - 1) {
                hudStatus.innerHTML = `<span style="color:#fbbf24;font-weight:bold;">👑 Đã chạm tầng ${currentScore}! Tầng cuối đang đung đưa. Bấm nút đỏ để Thua & Nộp điểm.</span>`;
            } else if (isRunning) {
                hudStatus.innerHTML = `<span style="color:#38bdf8;font-weight:bold;">⚡ Đang leo tầng ${currentScore + 1}...</span>`;
            }
        }

        function botLoop() {
            renderStatus();
            requestAnimationFrame(botLoop);
        }

        requestAnimationFrame(botLoop);

        window.AUTO_BOT = {
            start: () => { btnToggle.click(); },
            submit: finishAndSubmitScore,
            setTarget: (score) => {
                inputScore.value = score;
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
