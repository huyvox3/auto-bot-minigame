/**
 * Extension Content Script - Auto Bot Xếp Bánh Đón Trăng (V4 - God Mode & Instant Jump)
 * Tính năng đặc biệt:
 * 1. 🛡️ GOD MODE (BẤT TỬ): Khóa 100% Perfect, không bao giờ thua dù bấm phím bất cứ lúc nào.
 * 2. 🚀 NHẢY TẦNG TỨC THÌ: Nhảy thẳng 1 phát lên tầng n - 1 (ví dụ 199/200 tầng) trong 0.01 giây.
 * 3. ☠️ CHỈ THUA KHI BẤM NÚT: Tầng cuối sẽ đung đưa chờ, chỉ kết thúc và nộp điểm khi người dùng bấm nút "Kết thúc & Nộp điểm".
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
            GOD_MODE: true,
            PERFECT_TOLERANCE: 5.5
        };

        let isRunning = false;
        let startTime = 0;
        let lastDroppedScore = -1;

        let realCur = null;
        let realPrev = null;

        // Bật God Mode cờ hệ thống
        if (window.__MINIGAME_CORE__) {
            window.__MINIGAME_CORE__.setGodMode(CONFIG.GOD_MODE);
        } else {
            window.__GOD_MODE_ACTIVE__ = CONFIG.GOD_MODE;
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

        // HÀM NHẢY THẲNG TỚI TẦNG N - 1
        function jumpToFinalFloor() {
            const target = CONFIG.TARGET_SCORE;
            if (window.__MINIGAME_CORE__ && typeof window.__MINIGAME_CORE__.jumpToFloor === 'function') {
                window.__MINIGAME_CORE__.jumpToFloor(target);
            } else {
                // Giả lập nhảy nhanh qua DOM nếu là trang ngoài
                let curSc = getCurrentScore();
                while (curSc < target - 1) {
                    pressSpace();
                    curSc++;
                }
            }
            if (startTime === 0) startTime = Date.now();
            isRunning = true;
            renderStatus();
        }

        // HÀM CHỦ ĐỘNG THUA & NỘP ĐIỂM
        function finishAndSubmitScore() {
            const currentScore = getCurrentScore();
            // Nếu chưa đặt tầng cuối thì hoàn tất tầng cuối trước
            if (currentScore === CONFIG.TARGET_SCORE - 1) {
                pressSpace();
            }

            // Gọi kết thúc ván
            setTimeout(() => {
                if (window.__MINIGAME_CORE__ && typeof window.__MINIGAME_CORE__.forceFinish === 'function') {
                    window.__MINIGAME_CORE__.forceFinish();
                } else {
                    // Thả lệch có chủ đích
                    pressSpace();
                }
                isRunning = false;
                const hudBadge = document.getElementById('hud-badge');
                if (hudBadge) {
                    hudBadge.textContent = 'ĐÃ NỘP ĐIỂM';
                    hudBadge.style.background = '#8b5cf6';
                }
                const hudStatus = document.getElementById('hud-status');
                if (hudStatus) {
                    hudStatus.innerHTML = `<span style="color:#a78bfa;font-weight:bold;">🎉 Đã kết thúc & nộp ${CONFIG.TARGET_SCORE} tầng!</span>`;
                }
            }, 350);
        }

        // XỬ LÝ THẢ BÁNH TỰ ĐỘNG
        function tryDrop(curCenterX, prevCenterX, cakeWidth) {
            if (!isRunning) return;

            const currentScore = getCurrentScore();
            if (lastDroppedScore === currentScore) return;

            // Nếu đã đạt hoặc vượt tầng cuối -> DỪNG KHÔNG TỰ THẢ NỮA, để người chơi bấm nút thua
            if (currentScore >= CONFIG.TARGET_SCORE - 1) {
                return;
            }

            // Ở các tầng thường, tự động thả Perfect ngay khi khớp
            const dx = Math.abs(curCenterX - prevCenterX);
            if (CONFIG.GOD_MODE || dx <= CONFIG.PERFECT_TOLERANCE) {
                lastDroppedScore = currentScore;
                pressSpace();
            }
        }

        // HOOK CANVAS ELLIPSE CHO BÁNH
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
                <span>🛡️ GOD MODE (BẤT TỬ)</span>
                <span id="hud-badge" style="font-size:11px;background:#10b981;color:#fff;padding:2px 8px;border-radius:10px;font-weight:bold;">
                    BẤT TỬ ON
                </span>
            </div>

            <!-- Cấu hình điểm -->
            <div style="background:rgba(30,41,59,0.7);border-radius:8px;padding:8px 10px;margin-bottom:10px;border:1px solid #334155;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                    <label style="color:#94a3b8;font-size:12px;">🎯 Mục tiêu (Tầng):</label>
                    <input id="input-target-score" type="number" min="1" max="1000" value="${CONFIG.TARGET_SCORE}"
                        style="width:75px;background:#0f172a;border:1px solid #64748b;border-radius:4px;color:#38bdf8;font-weight:bold;padding:3px 6px;text-align:center;font-size:13px;" />
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <label style="color:#94a3b8;font-size:12px;">⏱️ Thời gian chơi (Phút):</label>
                    <input id="input-total-mins" type="number" min="0.1" max="180" step="0.5" value="${CONFIG.TOTAL_MINUTES}"
                        style="width:75px;background:#0f172a;border:1px solid #64748b;border-radius:4px;color:#fbbf24;font-weight:bold;padding:3px 6px;text-align:center;font-size:13px;" />
                </div>
            </div>

            <!-- NÚT TÍNH NĂNG GOD MODE -->
            <div style="margin-bottom:10px;display:flex;flex-direction:column;gap:6px;">
                <button id="btnJumpFloor" style="background:linear-gradient(135deg, #8b5cf6, #6366f1);color:#fff;border:none;padding:9px 12px;border-radius:8px;cursor:pointer;font-weight:bold;font-size:13px;box-shadow:0 4px 12px rgba(139,92,246,0.35);">
                    🚀 Nhảy thẳng tới tầng ${CONFIG.TARGET_SCORE - 1}
                </button>
                <button id="btnSubmitScore" style="background:linear-gradient(135deg, #ef4444, #dc2626);color:#fff;border:none;padding:9px 12px;border-radius:8px;cursor:pointer;font-weight:bold;font-size:13px;box-shadow:0 4px 12px rgba(239,68,68,0.35);">
                    ☠️ Bấm để THUA & Nộp điểm
                </button>
            </div>

            <!-- Thống kê trạng thái -->
            <div style="margin-bottom:10px;background:rgba(15,23,42,0.6);padding:6px 10px;border-radius:6px;border:1px solid #1e293b;">
                <div>🍰 Đang ở tầng: <b id="hud-cur-score" style="color:#4ade80;font-size:16px;">0</b> / <span id="hud-max-score">${CONFIG.TARGET_SCORE}</span></div>
                <div>⏳ Thời gian: <b id="hud-elapsed">00:00</b></div>
                <div style="margin-top:3px;">⚡ Trạng thái: <span id="hud-status" style="color:#c084fc;">Sẵn sàng</span></div>
            </div>

            <!-- Nút phụ điều khiển -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                <button id="btnExtToggle" style="background:#10b981;color:#fff;border:none;padding:7px 10px;border-radius:6px;cursor:pointer;font-weight:bold;font-size:12px;">
                    Bắt đầu Auto
                </button>
                <button id="btnExtDropOne" style="background:#3b82f6;color:#fff;border:none;padding:7px 10px;border-radius:6px;cursor:pointer;font-weight:bold;font-size:12px;">
                    Thả 1 tầng
                </button>
            </div>
        `;

        const inputScore = document.getElementById('input-target-score');
        const inputMins = document.getElementById('input-total-mins');
        const btnJump = document.getElementById('btnJumpFloor');
        const btnSubmit = document.getElementById('btnSubmitScore');
        const btnToggle = document.getElementById('btnExtToggle');
        const btnDropOne = document.getElementById('btnExtDropOne');
        const hudCurScore = document.getElementById('hud-cur-score');
        const hudMaxScore = document.getElementById('hud-max-score');
        const hudElapsed = document.getElementById('hud-elapsed');
        const hudStatus = document.getElementById('hud-status');

        function updateConfigFromInputs() {
            let sc = parseInt(inputScore.value, 10);
            let mi = parseFloat(inputMins.value);

            if (!isNaN(sc) && sc > 0) CONFIG.TARGET_SCORE = sc;
            if (!isNaN(mi) && mi > 0) CONFIG.TOTAL_MINUTES = mi;

            localStorage.setItem('bot_target_score', CONFIG.TARGET_SCORE);
            localStorage.setItem('bot_total_mins', CONFIG.TOTAL_MINUTES);

            hudMaxScore.textContent = CONFIG.TARGET_SCORE;
            btnJump.textContent = `🚀 Nhảy thẳng tới tầng ${Math.max(1, CONFIG.TARGET_SCORE - 1)}`;
        }

        inputScore.oninput = updateConfigFromInputs;
        inputMins.oninput = updateConfigFromInputs;

        btnJump.onclick = () => {
            const btnStart = document.querySelector('#btnStart');
            if (btnStart && !btnStart.disabled && document.querySelector('#ovlStart.on')) {
                btnStart.click();
                setTimeout(jumpToFinalFloor, 500);
            } else {
                jumpToFinalFloor();
            }
        };

        btnSubmit.onclick = () => {
            finishAndSubmitScore();
        };

        btnDropOne.onclick = () => {
            pressSpace();
        };

        btnToggle.onclick = () => {
            isRunning = !isRunning;
            if (isRunning) {
                if (startTime === 0) startTime = Date.now();
                btnToggle.textContent = 'Tạm dừng';
                btnToggle.style.background = '#ef4444';
                const btnStart = document.querySelector('#btnStart');
                if (btnStart && !btnStart.disabled && document.querySelector('#ovlStart.on')) {
                    btnStart.click();
                }
            } else {
                btnToggle.textContent = 'Bắt đầu Auto';
                btnToggle.style.background = '#10b981';
            }
        };

        function renderStatus() {
            const currentScore = getCurrentScore();
            hudCurScore.textContent = currentScore;
            const elapsed = startTime > 0 ? Math.floor((Date.now() - startTime) / 1000) : 0;
            hudElapsed.textContent = fmtTime(elapsed);

            if (currentScore >= CONFIG.TARGET_SCORE - 1) {
                hudStatus.innerHTML = `<span style="color:#fbbf24;font-weight:bold;">👑 Đang ở tầng cuối (${currentScore})! Bấm nút đỏ để Thua & Nộp điểm.</span>`;
            } else {
                hudStatus.innerHTML = `<span style="color:#38bdf8;">Đang xếp tầng ${currentScore + 1}...</span>`;
            }
        }

        function botLoop() {
            renderStatus();

            // Nếu đang bật Auto và chưa tới tầng cuối thì tự thả
            if (isRunning) {
                const currentScore = getCurrentScore();
                if (currentScore < CONFIG.TARGET_SCORE - 1) {
                    if (window.__MINIGAME_CORE__) {
                        const c = window.__MINIGAME_CORE__.getCur();
                        const p = window.__MINIGAME_CORE__.getPrev();
                        if (c && p) {
                            tryDrop(c.x + c.w / 2, p.x + p.w / 2, p.w);
                        }
                    }
                }
            }

            requestAnimationFrame(botLoop);
        }

        requestAnimationFrame(botLoop);

        window.AUTO_BOT = {
            jump: jumpToFinalFloor,
            submit: finishAndSubmitScore,
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
