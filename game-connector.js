(function () {
    'use strict';

    // Helper DOM an toàn, không đụng chạm tới $ của jQuery
    const qs = s => document.querySelector(s);
    const qsa = s => document.querySelectorAll(s);
    const rnd = (a, b) => a + Math.random() * (b - a);
    const MIN_RANK = 20;
    const custom = CUSTOM_CONFIG || '';
    /* ================== CẤU HÌNH GIAO DIỆN & VẬT LÝ ================== */
    const CFG = {
        from: custom.from_date || '2026-09-22',
        to: custom.to_date || '2026-09-29',
        dailyPrizeTo: '2026-09-28',
        turns: 3,
        share: { fb: 2, zl: 2 },
        shareUrl: window.location.href,
        miles: [
            {
                min: 20,
                lvl: 'Ưu đãi Tiêu Chuẩn',
                ic: '<img src="/images/kq-dat-20.jpg" height="34" class="icon_result" />',
                nm: 'Voucher giảm giá chỉ 31K/năm đầu',
                ds: 'Áp dụng cho .CLOUD | .ONLINE | .STORE'
            },
            {
                min: 50,
                lvl: 'Ưu đãi Cao Cấp',
                ic: '<img src="/images/kq-dat-50.jpg" height="34" class="icon_result" />',
                nm: 'Voucher tên miền + chọn thêm 1 ưu đãi',
                ds: 'Gồm quà tiêu chuẩn và một trong hai lựa chọn bên dưới',
                opts: [
                    { id: 'giam50', ic: `${ic(ICONS.tag)}`, nm: 'Giảm thêm 50.000đ tên miền .VN | .COM.VN', sub: 'Đăng ký từ 02 năm' },
                    { id: 'iovn',   ic: `${ic(ICONS.domain)}`, nm: 'Tặng 1 năm sử dụng tên miền .IO.VN', sub: 'Trị giá 50.000đ' }
                ]
            }
        ],
        zones: [
            { from: 0,  cake: 'nuong' },
            { from: 10, cake: 'deo' },
            { from: 20, cake: 'gac' },
            { from: 30, cake: 'matcha' },
            { from: 40, cake: 'khoaimon' }
        ],
        cakes: {
            nuong:    { t: '#F0A63C', m: '#DE8524', b: '#B45F12', e: '#7C3C07', p: 'rgba(112,52,6,.55)' },
            deo:      { t: '#FFFAF0', m: '#F4E7D2', b: '#DCC9A8', e: '#A78F68', p: 'rgba(150,124,84,.5)' },
            gac:      { t: '#F4735F', m: '#DE4438', b: '#B22222', e: '#750F10', p: 'rgba(110,15,16,.5)' },
            matcha:   { t: '#B7D98C', m: '#8FBB5E', b: '#638F35', e: '#3A5C1B', p: 'rgba(48,80,22,.5)' },
            khoaimon: { t: '#D3BBEC', m: '#B294D8', b: '#8A66B8', e: '#573C82', p: 'rgba(70,46,110,.5)' }
        }
    };

    const BEE = {
        yay: 'data:image/webp;base64,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'
    };

    /* ================== KHỞI TẠO SDK & SOCIAL SHARE ================== */
    // Nạp MinigameSDK chuẩn theo config object
    const sdk = new MinigameSDK({
        campaignCode: 'trung_thu_2026',
        actionBase: '/vn/minigame.html'
    });

    let currentPlayToken = '';
    let currentPlayId = 0;
    let playStartTime = 0;

    const today = new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh'
    });
    // So sánh trực tiếp với chuỗi kết thúc
    const isNotStarted = today < CFG.from;
    const isOver = today > CFG.to;

    const S = {
        reg: null,
        turns: CFG.turns,
        best: 0,
        bestProg: 0,
        lastScore: 0,
        lastMile: null,
        pickOpt: null,
        fbDone: false,
        zlDone: false
    };

    // Khởi tạo SocialShare chuẩn theo thư viện share.js
    const social = new SocialShare({
        url: CFG.shareUrl || window.location.href,
        defaultHashtag: '',
        zaloOaId: '1234567890123456',
        zaloOaUrl: 'https://zalo.me/3610449719704001474',
        autoLoadZaloSdk: false,
        onShared: async function (channel) {
            try {
                const res = await sdk.share(channel);
                if (res && res.success) {
                    if (res.data && typeof res.data.remain_turn !== 'undefined') {
                        S.turns = res.data.remain_turn;
                        qs('#turnN').textContent = S.turns;
                    }
                    if (channel === 'facebook') S.fbDone = true;
                    if (channel === 'zalo') S.zlDone = true;
                    toast(res.msg || `Cộng thành công lượt chơi từ ${channel}!`);
                } else {
                    toast(res && res.msg ? res.msg : 'Không thể cộng lượt chơi');
                }
            } catch (err) {
                toast('Lỗi kết nối máy chủ');
            }
        }
    });

    let toastT = null, toastT2 = null;
    function toast(m) {
        const e = qs('#toast');
        if (!e) return;
        e.textContent = m;
        clearTimeout(toastT);
        clearTimeout(toastT2);
        e.className = 'toast';
        void e.offsetWidth;
        e.className = 'toast on';
        toastT = setTimeout(() => { e.className = 'toast on out'; }, 6000);
        toastT2 = setTimeout(() => { e.className = 'toast'; }, 6560);
    }

    function openM(id) {
        const el = qs(id);
        if (el) el.classList.add('on');
        document.body.classList.add('lock');
    }
    function closeM() {
        qsa('.modal').forEach(m => m.classList.remove('on'));
        document.body.classList.remove('lock');
    }

    function maskMail(m) {
        if (!m) return '';
        const [u, d] = m.split('@');
        if (!d) return m;
        const keep = Math.min(4, Math.max(2, u.length - 4));
        return u.slice(0, keep) + '*'.repeat(Math.max(3, u.length - keep)) + '@' + d;
    }

    function medal(r) { return r === 1 ? `${ic(ICONS.rank1)}` : r === 2 ? `${ic(ICONS.rank2)}` : r === 3 ? `${ic(ICONS.rank3)}` : r; }

    /* ================== BẢNG XẾP HẠNG ================== */
    async function loadRealLeaderboard() {
        try {
            const sel = qs('#daySel');
            const selectedDate = sel ? sel.value : '';
            const viewDate = selectedDate.slice(0,5);
            const res = await sdk.getRanking(selectedDate);
            if (res && res.success && res.data && res.data.length > 0) {
                const rowsHtml = res.data.map((r, i) => {
                    let baggeHtml = '';
                    if (r.has_won_daily && r.won_date) {
                        if (r.won_date === viewDate) {
                            baggeHtml = `<span class="badge-winner">Thắng giải ngày</span>`;
                        } else {
                            baggeHtml = `<span class="badge-won">Đã có giải ngày ${r.won_date}</span>`;
                        }
                    }
                    return `
                        <tr class="${r.is_me ? 'me' : ''}">
                            <td class="rk">${medal(i + 1)}</td>
                            <td>
                                <span class="emask">${r.email}</span>
                                ${r.is_me ? '<span class="youtag">bạn</span>' : ''}
                                ${baggeHtml}
                            </td>
                        </tr>
                    `
                }).join('');
                if (qs('#lbDay')) qs('#lbDay').innerHTML = rowsHtml;
                //if (qs('#lbProg')) qs('#lbProg').innerHTML = rowsHtml;
            } else {
                if (qs('#lbDay')) qs('#lbDay').innerHTML = `<tr><td colspan="2" style="text-align:center;padding:15px;color:#888;">Hôm nay chưa có ai ghi danh</td></tr>`;
            }
        } catch (e) {
            console.error("Lỗi nạp bảng xếp hạng:", e);
        }
    }
    async function loadRealLeaderboardGrand() {
        try {
            const res = await sdk.getRankingGrand();
            if (res && res.success && res.data && res.data.length > 0) {
                const rowsHtml = res.data.map((r, i) => {
                    return `
                        <tr class="${r.is_me ? 'me' : ''}">
                            <td class="rk">${medal(i + 1)}</td>
                            <td>
                                <span class="emask">${r.email}</span>
                                ${r.is_me ? '<span class="youtag">bạn</span>' : ''}
                            </td>
                        </tr>
                    `
                }).join('');
                if (qs('#lbProg')) qs('#lbProg').innerHTML = rowsHtml;
                //if (qs('#lbProg')) qs('#lbProg').innerHTML = rowsHtml;
            } else {
                if (qs('#lbProg')) qs('#lbProg').innerHTML = `<tr><td colspan="2" style="text-align:center;padding:15px;color:#888;">Hôm nay chưa có ai ghi danh</td></tr>`;
            }
        } catch (e) {
            console.error("Lỗi nạp bảng xếp hạng:", e);
        }
    }
    function days(end) {
        const out = [], a = new Date(CFG.from), b = new Date(end || CFG.to);
        for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) out.push(new Date(d));
        return out;
    }
    function fmt(d) { return String(d.getDate()).padStart(2, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + d.getFullYear(); }

    (function initDays() {
        const sel = qs('#daySel'), ds = days(CFG.dailyPrizeTo), today = new Date();
        if (!sel) return;
        ds.forEach(d => {
            const o = document.createElement('option');
            o.value = fmt(d);
            o.textContent = fmt(d);
            if (d.toDateString() === today.toDateString()) o.selected = true;
            sel.append(o);
        });
        if (!sel.value && ds.length) sel.value = fmt(ds[0]);
        sel.onchange = loadRealLeaderboard;
    })();

    function progCountdown() {
        const end = new Date(CFG.to + 'T23:59:59'), now = new Date();
        const el = qs('#cdProg');
        if (!el) return;
        if (now > end) {
            el.innerHTML = `${ic(ICONS.check)} Chương trình đã kết thúc, đang chốt kết quả`;
            return;
        }
        const left = Math.ceil((end - now) / 86400000);
        el.innerHTML = `${ic(ICONS.time)}` + ' Còn ' + left + ' ngày nữa chốt giải chương trình';
    }
    progCountdown();
    setInterval(progCountdown, 60000);

    /**
     * Nạp danh sách người thắng cuộc từ Backend API (/ajax/minigame/winners)
     */
    async function paintWin() {
        // Hỗ trợ cả 2 id lbWin hoặc tbWin đề phòng FE đổi id
        const el = qs('#lbWin') || qs('#tbWin');
        if (!el) return;

        try {
            const res = await sdk.getWinners();

            if (isOver) {
                const table = el.closest("table");
                const thNguoiNhan = table.querySelectorAll("thead th")[1];
                if (thNguoiNhan) {
                    thNguoiNhan.insertAdjacentHTML("afterend", `<th>Thành tích</th>`);
                }
            }
            if (res && res.success && res.data && res.data.length > 0) {
                el.innerHTML = res.data.map(w => {
                    // Chuyển định dạng YYYY-MM-DD sang DD/MM/YYYY nếu cần
                    let dateStr = w.date || w.rank_date || '';

                    // Che email nếu Backend chưa che
                    const rawEmail = w.email || w.winner_email || '';
                    const displayEmail = rawEmail.indexOf('*') !== -1 ? rawEmail : maskMail(rawEmail);
                    const scoreUser = w.score || '-';
                    const giftName = w.gift || w.gift_name || 'Phần thưởng Top 1';
                    const isBig = w.is_grand || w.big || false;
                    let scoreHtml = '';
                    if (isOver) {
                        scoreHtml = `<td><span class="score">${scoreUser} Tầng</span></td>`;
                    }

                    return `
                        <tr class="${isBig ? 'big grand' : ''}">
                            <td class="dt">${dateStr}</td>
                            <td><span class="emask">${displayEmail}</span></td>
                            ${scoreHtml}
                            <td class="pz">${giftName}</td>
                        </tr>
                    `;
                }).join('');
            } else {
                el.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:26px 14px;color:var(--xam);">
                    Chưa có kết quả. Giải thưởng sẽ được công bố sau mỗi ngày.
                </td></tr>`;
            }
        } catch (e) {
            console.error("Lỗi nạp danh sách giải thưởng:", e);
            el.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:20px;color:#d84315;">
                Không thể tải danh sách giải thưởng lúc này.
            </td></tr>`;
        }
    }


    qsa('.tabs .tb').forEach(b => b.onclick = () => {
        qsa('.tabs .tb').forEach(x => x.classList.toggle('on', x === b));
        const t = b.dataset.tab;
        if (qs('#paneProg')) qs('#paneProg').classList.toggle('on', t === 'prog');
        if (qs('#paneWin')) qs('#paneWin').classList.toggle('on', t === 'win');
    });

    // Đồng bộ phiên MinigameSDK khi DOM sẵn sàng
    window.addEventListener('DOMContentLoaded', async () => {
        if (isNotStarted) {
            if (qs('#game')) qs('#game').remove();
            if (qs('#bxh')) qs('#bxh').remove();
            return;
        }
        try {
            const res = await sdk.init();
            if (res && res.success && res.data) {
                if (typeof res.data.remain_turn !== 'undefined') {
                    S.turns = res.data.remain_turn;
                    if (qs('#turnN')) qs('#turnN').textContent = S.turns;
                    if (S.turns <= 0 && qs('#btnStart')) qs('#btnStart').disabled = true;
                }

                if (typeof res.data.daily_high_score !== 'undefined') {
                    S.best = res.data.daily_high_score;
                    if (qs('#recN')) qs('#recN').textContent = S.best;
                    if (qs('#hBest')) qs('#hBest').textContent = S.best;
                }

                if (typeof res.data.name !== 'undefined' && typeof res.data.email !== 'undefined' && res.data.name !== '' && res.data.email !== '') {
                    S.reg = { name: res.data.name, mail: res.data.email };
                    if (qs('#iName')) {
                        qs('#iName').value = res.data.name;
                        qs('#iName').readOnly = true;
                    }
                    if (qs('#iMail')) {
                        qs('#iMail').value = res.data.email;
                        qs('#iMail').readOnly = true;
                    }
                    if (typeof res.data.phone !== 'undefined' && res.data.phone !== '') {
                        if (qs('#iPhone')) qs('#iPhone').value = res.data.phone;
                    }
                }

                if(typeof res.data.msg_free_turns !== 'undefined' && res.data.msg_free_turns !== '') {
                    toast(res.data.msg_free_turns);
                }
            }
        } catch (e) {
            console.error("Lỗi khởi tạo SDK:", e);
        }
        loadRealLeaderboard();
        loadRealLeaderboardGrand();
        paintWin();
    });

    /* ================== GHI DANH & NHẬN THƯỞNG ================== */
    function openJoin() {
        const m = S.lastMile;
        if (qs('#fTitle')) qs('#fTitle').textContent = m ? 'Nhận ưu đãi & ghi danh' : 'Ghi danh để lưu kỷ lục';
        if (qs('#fLead')) {
            qs('#fLead').innerHTML = m
                ? `Mã ưu đãi gửi về email này. Kỷ lục <b>${S.lastScore} tầng</b> cũng được ghi vào bảng xếp hạng.`
                : `Ghi danh để kỷ lục <b>${S.lastScore} tầng</b> được tính vào bảng xếp hạng.`;
        }
        closeM();
        openM('#mForm');
    }

    if (qs('#fBack')) qs('#fBack').onclick = () => { closeM(); if (!running) toStart(); };

    if (qs('#fSend')) {
        qs('#fSend').onclick = async () => {
            const nm = qs('#iName') ? qs('#iName').value.trim() : '';
            const ml = qs('#iMail') ? qs('#iMail').value.trim() : '';
            const ph = qs('#iPhone') ? qs('#iPhone').value.trim() : '';

            if (qs('#fdName')) qs('#fdName').classList.toggle('bad', nm.length < 2);
            const om = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ml);
            if (qs('#fdMail')) qs('#fdMail').classList.toggle('bad', !om);
            if (nm.length < 2 || !om) return;

            const btnSend = qs('#fSend');
            btnSend.disabled = true;
            btnSend.textContent = 'Đang xử lý...';

            const type = S.lastScore >= 50 ? 2 : 1;

            try {
                // Gọi API claimReward theo đúng minigame.js
                const res = await sdk.claimReward({
                    playId: currentPlayId,
                    email: ml,
                    name: nm,
                    voice: ph,
                    type: type,
                    reward_options: S.pickOpt || '',
                });

                if (res && res.success) {
                    S.reg = { name: nm, mail: ml };
                    S.bestProg = Math.max(S.bestProg, S.best);
                    closeM();
                    loadRealLeaderboard();
                    loadRealLeaderboardGrand();
                    toast(res.msg || 'Ghi danh thành công!');
                    if (!running) toStart();
                } else {
                    toast((res && res.msg) || 'Không thể nhận thưởng');
                }
            } catch (e) {
                toast('Lỗi kết nối máy chủ');
            } finally {
                btnSend.disabled = false;
                btnSend.textContent = 'Xác nhận ghi danh';
            }
        };
    }

    const openRules = () => openM('#mRules');
    if (qs('#openRules')) qs('#openRules').onclick = openRules;
    if (qs('#openRules2')) qs('#openRules2').onclick = openRules;
    if (qs('#openRules3')) qs('#openRules3').onclick = openRules;
    if (qs('#ruleClose')) qs('#ruleClose').onclick = () => { closeM(); qs('#game').scrollIntoView({ behavior: 'smooth' }); };

    addEventListener('keydown', e => { if (e.key === 'Escape' && !running) closeM(); });
    qsa('[data-close]').forEach(b => b.onclick = () => { closeM(); if (!running) toStart(); });

    /* ================== CHIA SẺ MẠNG XÃ HỘI ================== */
    function share(kind) {
        const done = kind === 'fb' ? S.fbDone : S.zlDone;
        if (done) {
            toast('Bạn đã nhận thưởng của kênh này hôm nay rồi.');
            return;
        }
        const channel = kind === 'fb' ? 'facebook' : 'zalo';
        const tag = 'Chơi ngay Minigame Xếp Bánh Đón Trăng để có cơ hội nhần nhiều phần quà hấp dẫn!';
        social.share(channel, { hashtag: tag, score: S.best });
    }

    if (qs('#shFb')) qs('#shFb').onclick = () => share('fb');
    if (qs('#shZl')) qs('#shZl').onclick = () => share('zl');

    /* ================== CANVAS 2.5D GAME ENGINE ================== */
    const cv = qs('#cv'), ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    let BASE_W = 160;
    const BH = 34, GROUND = 58, PERFECT = 6, GROW = 6;
    const SPD0 = 2.92, SPD_STEP = 0.176, SPD_MAX = 9.2, ZONE_UP = 0.56;
    const FLASH_MS = 1000;
    let blocks = [], cur = null, falls = [], score = 0, speed = SPD0, cam = 0, running = false, raf = null;
    let flashT = 0, flashMsg = '', winds = [], puff = [], clouds = [];
    let mX = 0, mY = 0, mIn = false, press = 0, rip = [];
    window.__MINIGAME_CORE__ = {
        getCur: () => cur,
        getPrev: () => blocks[blocks.length - 1],
        getScore: () => score,
        getSpeed: () => speed,
        getRunning: () => running,
        getBlocks: () => blocks,
        setGodMode: (val) => { window.__GOD_MODE_ACTIVE__ = !!val; },
        jumpToFloor: function(targetScore) {
            if (!running) return;
            const targetCount = Math.max(1, targetScore - 1);
            blocks = [];
            for (let i = 0; i <= targetCount; i++) {
                blocks.push({
                    x: W / 2 - BASE_W / 2,
                    w: BASE_W,
                    cake: zoneCake(i)
                });
            }
            score = targetCount;
            if (qs('#hTang')) qs('#hTang').textContent = score;
            if (score > S.best) {
                S.best = score;
                if (qs('#hBest')) qs('#hBest').textContent = S.best;
                if (qs('#recN')) qs('#recN').textContent = S.best;
            }
            cam = Math.max(0, (blocks.length * BH) - H * 0.5);
            spawn();
            if (qs('#cv')) draw();
        },
        forceFinish: function() {
            if (!running) return;
            cur = null;
            over();
        }
    };

    function baseSpeed() { return SPD0 + Math.floor(score / 10) * ZONE_UP; }

    function resize() {
        const stageEl = qs('#stage');
        if (!stageEl) return;
        const r = stageEl.getBoundingClientRect();
        dpr = Math.min(2, window.devicePixelRatio || 1);
        if (r.width < 40 || r.height < 40) return;
        W = r.width; H = r.height;
        cv.width = W * dpr; cv.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        BASE_W = Math.max(112, Math.min(186, W * 0.29));
        if (!running) draw();
    }
    addEventListener('resize', resize);

    function zoneCake(n) {
        let c = 'nuong';
        CFG.zones.forEach(z => { if (n >= z.from) c = z.cake; });
        return c;
    }

    function reset() {
        blocks = []; falls = []; winds = []; puff = []; clouds = []; rip = [];
        press = 0; score = 0; speed = SPD0; cam = 0; flashT = 0; flashMsg = ''; lastDrop = 0;
        blocks.push({ x: W / 2 - BASE_W / 2, w: BASE_W, cake: 'nuong' });
        spawn();
        if (qs('#hTang')) qs('#hTang').textContent = '0';
    }

    function spawn() {
        const prev = blocks[blocks.length - 1];
        const fromLeft = blocks.length % 2 === 0;
        cur = { x: fromLeft ? -prev.w - 24 : W + 24, w: prev.w, dir: fromLeft ? 1 : -1, cake: zoneCake(blocks.length) };
    }

    let lastDrop = 0;
    const DROP_LOCK = 280;

    function drop() {
        if (!running || !cur) return;
        const now = performance.now();
        if (now - lastDrop < DROP_LOCK) return;
        if (cur.x + cur.w <= 0 || cur.x >= W) return;
        lastDrop = now;

        const prev = blocks[blocks.length - 1];
        if (window.__GOD_MODE_ACTIVE__) {
            cur.x = prev.x;
            cur.w = prev.w;
        }
        const dx = cur.x - prev.x, ov = prev.w - Math.abs(dx);

        if (ov <= 0) {
            falls.push({ x: cur.x, y: blocks.length * BH, w: cur.w, vy: 0, vx: cur.dir * 1.7, rot: 0, cake: cur.cake });
            cur = null;
            return over();
        }

        if (Math.abs(dx) <= PERFECT) {
            const grow = Math.max(0, Math.min(GROW, BASE_W - prev.w));
            cur.w = prev.w + grow;
            cur.x = prev.x - grow / 2;
            flashT = performance.now() + FLASH_MS;
            flashMsg = cur.w >= BASE_W - 0.1 ? 'KHÍT! Bánh nở tối đa' : 'KHÍT! Bánh nở rộng';
            speed = baseSpeed();
            for (let i = 0; i < 16; i++) puff.push({ x: cur.x + rnd(0, cur.w), y: blocks.length * BH, vx: rnd(-2.6, 2.6), vy: rnd(.5, 3), l: rnd(14, 28) });
        } else {
            if (dx > 0) {
                falls.push({ x: prev.x + prev.w, y: blocks.length * BH, w: dx, vy: 0, vx: 1.6, rot: 0, cake: cur.cake });
            } else {
                falls.push({ x: cur.x, y: blocks.length * BH, w: -dx, vy: 0, vx: -1.6, rot: 0, cake: cur.cake });
            }
            cur.x = Math.max(prev.x, cur.x);
            cur.w = ov;
            speed = Math.min(SPD_MAX, speed + SPD_STEP);
        }

        blocks.push(cur);
        score++;
        if (qs('#hTang')) qs('#hTang').textContent = score;

        if (score > S.best) {
            S.best = score;
            if (qs('#hBest')) qs('#hBest').textContent = S.best;
        }
        if (speed < baseSpeed()) speed = baseSpeed();
        spawn();
    }

    async function over() {
        running = false;
        cancelAnimationFrame(raf);
        document.body.classList.remove('playing');

        S.lastScore = score;
        S.best = Math.max(S.best, score);
        if (S.reg) S.bestProg = Math.max(S.bestProg, S.best);

        if (qs('#hBest')) qs('#hBest').textContent = S.best;
        if (qs('#recN')) qs('#recN').textContent = S.best;

        // Gọi API kết thúc ván theo đúng MinigameSDK
        const duration = playStartTime > 0 ? ((performance.now() - playStartTime) / 1000).toFixed(2) : 0;
        try {
            const res = await sdk.finishGame(currentPlayToken, score, parseFloat(duration));
            if (res && res.success && res.data) {
                currentPlayId = res.data.play_id;
                loadRealLeaderboard();
                loadRealLeaderboardGrand();
                setTimeout(showResult, 650);
            } else {
                toast((res && res.msg) || 'Kết quả không hợp lệ');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (e) {
            console.error("Lỗi gửi kết quả ván:", e);
        }
    }

    let lastT = 0;
    function loop(now) {
        if (!running) return;
        if (!lastT) lastT = now || performance.now();
        const t = now || performance.now();
        const dt = Math.min(3, Math.max(0.2, (t - lastT) / 16.6667));
        lastT = t;

        if (cur) {
            cur.x += speed * cur.dir * dt;
            const pad = 50;
            if (cur.x < -cur.w - pad) { cur.x = -cur.w - pad; cur.dir = 1; }
            if (cur.x > W + pad) { cur.x = W + pad; cur.dir = -1; }
        }

        falls.forEach(f => { f.vy += 0.6 * dt; f.y -= f.vy * dt; f.x += f.vx * dt; f.rot += 0.08 * dt; });
        falls = falls.filter(f => f.y > -(H + 260));
        puff.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt; });
        puff = puff.filter(p => p.l > 0);

        const windLv = Math.max(0, Math.min(1, (score - 8) / 26));
        if (windLv > 0 && Math.random() < (0.16 + windLv * 0.55) * dt) {
            const dir = Math.random() < .5 ? -1 : 1;
            winds.push({
                x: dir > 0 ? -90 : W + 90,
                y: rnd(-30, H),
                len: rnd(50, 150) * (0.6 + windLv),
                sp: dir * (6 + windLv * 13 + rnd(0, 4)),
                a: 0.28 + windLv * 0.5,
                w: rnd(1.2, 2.8),
                leaf: Math.random() < 0.14 + windLv * 0.2,
                rot: 0,
                vr: rnd(-.2, .2)
            });
        }
        winds.forEach(w => { w.x += w.sp * dt; w.y += Math.sin(w.x / 70) * 0.7 * dt; w.rot += w.vr * dt; w.a -= (0.005 + windLv * 0.004) * dt; });
        winds = winds.filter(w => w.a > 0 && w.x > -260 && w.x < W + 260);

        updateClouds(dt);
        const target = Math.max(0, (blocks.length * BH) - H * 0.5);
        cam += (target - cam) * Math.min(1, 0.13 * dt);
        if (press > 0) press -= dt;
        rip.forEach(r => r.t += dt);
        rip = rip.filter(r => r.t < r.life);

        draw();
        raf = requestAnimationFrame(loop);
    }

    const sy = wy => H - GROUND - wy + cam;
    const lerp = (a, b, t) => a + (b - a) * t;

    function mix(c1, c2, t) {
        const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
        const A = p(c1), B = p(c2);
        return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`;
    }

    function drawSky() {
        const h = blocks.length;
        const st = [
            { at: 0,  a: '#3E2478', b: '#120C28' },
            { at: 10, a: '#2E1B5C', b: '#0D0820' },
            { at: 22, a: '#1E1240', b: '#080416' },
            { at: 34, a: '#150C34', b: '#05020C' },
            { at: 46, a: '#2A1050', b: '#090316' }
        ];
        let i = 0;
        for (let k = 0; k < st.length; k++) if (h >= st[k].at) i = k;
        const j = Math.min(st.length - 1, i + 1);
        const t = st[j].at > st[i].at ? Math.min(1, (h - st[i].at) / (st[j].at - st[i].at)) : 0;
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, mix(st[i].a, st[j].a, t));
        g.addColorStop(1, mix(st[i].b, st[j].b, t));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        if (h >= 40) {
            const al = Math.min(.36, (h - 40) / 28);
            const ng = ctx.createLinearGradient(0, H * .1, W, H * .75);
            ng.addColorStop(0, 'rgba(120,80,220,0)');
            ng.addColorStop(.5, `rgba(150,90,230,${al})`);
            ng.addColorStop(1, 'rgba(60,140,220,0)');
            ctx.fillStyle = ng;
            ctx.fillRect(0, 0, W, H);
        }

        const so = cam * 0.26;
        ctx.fillStyle = 'rgba(255,244,206,.9)';
        for (let k = 0; k < 72; k++) {
            const sx = (k * 97) % W, syy = ((k * 61 + so) % (H + 120)) - 60;
            ctx.globalAlpha = .3 + ((k * 13) % 50) / 100 * .6;
            ctx.beginPath();
            ctx.arc(sx, syy, (k % 7 === 0) ? 1.7 : 1, 0, 7);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        drawMoonAt(30 * BH);
        drawGround();
    }

    function drawMoonAt(wy) {
        const my = sy(wy), r = Math.min(W * 0.2, 80);
        if (my < -r * 3 || my > H + r * 3) return;
        const mx = W * 0.74;
        const g = ctx.createRadialGradient(mx, my, r * .2, mx, my, r * 2.4);
        g.addColorStop(0, 'rgba(255,244,206,.4)');
        g.addColorStop(1, 'rgba(255,244,206,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mx, my, r * 2.4, 0, 7);
        ctx.fill();

        const g2 = ctx.createRadialGradient(mx - r * .35, my - r * .35, r * .12, mx, my, r);
        g2.addColorStop(0, '#FFFEF4');
        g2.addColorStop(.55, '#FFF4CE');
        g2.addColorStop(1, '#E6CA80');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(mx, my, r, 0, 7);
        ctx.fill();

        ctx.fillStyle = 'rgba(180,150,80,.2)';
        [[-.3, -.2, .17], [.24, -.32, .11], [.08, .3, .15], [-.36, .26, .09]].forEach(([a, b, c]) => {
            ctx.beginPath();
            ctx.arc(mx + r * a, my + r * b, r * c, 0, 7);
            ctx.fill();
        });
    }

    let SKY = null;
    function buildSkyline() {
        const R = (seed => () => ((seed = seed * 16807 % 2147483647) / 2147483647))(20260926);
        const items = [];
        let x = 0;
        while (x < 1) {
            const r = R(), o = { x };
            if (r < .44) {
                o.t = 'house'; o.w = .042 + R() * .028; o.h = .20 + R() * .14;
            } else if (r < .88) {
                o.t = 'block'; o.w = .048 + R() * .04; o.h = .38 + R() * .5; o.cols = 2 + Math.floor(R() * 3); o.rows = 5 + Math.floor(R() * 7);
            } else {
                o.t = 'slim'; o.w = .026 + R() * .018; o.h = .62 + R() * .34; o.rows = 8 + Math.floor(R() * 6);
            }
            items.push(o);
            x = o.x + o.w + 0.006 + R() * 0.02;
        }
        items.push({ t: 'bitexco', x: .145, w: .062, h: 1.42 });
        items.push({ t: 'lm81',    x: .775, w: .070, h: 1.95 });
        SKY = items;
    }

    function drawGround() {
        if (!SKY) buildSkyline();
        const gy = sy(-6);
        if (gy > H + 340 || gy < -520) return;
        const U = Math.min(W, H) * 0.108;
        const ink = '#0B0620', win = 'rgba(255,201,92,';
        const R = (seed => () => ((seed = seed * 48271 % 2147483647) / 2147483647))(777);

        ctx.save();
        ctx.fillStyle = ink;
        ctx.fillRect(0, gy, W, H - gy + 420);
        SKY.forEach(o => {
            const bx = o.x * W, bw = Math.max(9, o.w * W), bh = o.h * U * 2.1, ty = gy - bh;
            ctx.fillStyle = ink;
            if (o.t === 'house') {
                ctx.beginPath();
                ctx.moveTo(bx, gy);
                ctx.lineTo(bx, ty + bh * .36);
                ctx.lineTo(bx + bw / 2, ty);
                ctx.lineTo(bx + bw, ty + bh * .36);
                ctx.lineTo(bx + bw, gy);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = win + (.5 + R() * .4) + ')';
                ctx.fillRect(bx + bw * .34, gy - bh * .3, bw * .32, bh * .2);
            } else if (o.t === 'block') {
                ctx.fillRect(bx, ty, bw, bh);
                for (let r = 0; r < o.rows; r++) for (let cc = 0; cc < o.cols; cc++) {
                    if (R() < .36) continue;
                    ctx.fillStyle = win + (.28 + R() * .55) + ')';
                    ctx.fillRect(bx + bw * (.16 + cc * (.68 / o.cols)), ty + bh * (.08 + r * (.84 / o.rows)), bw * .42 / o.cols, bh * .5 / o.rows);
                }
            } else if (o.t === 'slim') {
                ctx.fillRect(bx, ty, bw, bh);
                ctx.fillRect(bx + bw * .4, ty - bh * .1, bw * .2, bh * .1);
                for (let r = 0; r < o.rows; r++) {
                    if (R() < .42) continue;
                    ctx.fillStyle = win + (.28 + R() * .5) + ')';
                    ctx.fillRect(bx + bw * .22, ty + bh * (.08 + r * (.84 / o.rows)), bw * .56, bh * .4 / o.rows);
                }
            } else if (o.t === 'bitexco') {
                ctx.beginPath();
                ctx.moveTo(bx, gy);
                ctx.quadraticCurveTo(bx + bw * .05, ty + bh * .36, bx + bw * .30, ty + bh * .02);
                ctx.lineTo(bx + bw * .42, ty);
                ctx.quadraticCurveTo(bx + bw * .86, ty + bh * .30, bx + bw * .96, gy);
                ctx.closePath();
                ctx.fill();
                const hy = ty + bh * .32;
                ctx.fillStyle = ink;
                ctx.fillRect(bx + bw * .45, hy - bw * .05, bw * .52, bw * .10);
                ctx.beginPath();
                ctx.ellipse(bx + bw * .96, hy, bw * .44, bw * .10, 0, 0, 7);
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,201,92,.45)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.ellipse(bx + bw * .96, hy, bw * .44, bw * .10, 0, 0, 7);
                ctx.stroke();
                for (let r = 0; r < 20; r++) {
                    if (R() < .34) continue;
                    ctx.fillStyle = win + (.3 + R() * .5) + ')';
                    ctx.fillRect(bx + bw * .3, ty + bh * (.06 + r * .045), bw * .36, bh * .02);
                }
                ctx.fillStyle = 'rgba(255,70,70,.95)';
                ctx.beginPath();
                ctx.arc(bx + bw * .42, ty - 3, 2.1, 0, 7);
                ctx.fill();
            } else if (o.t === 'lm81') {
                const cols = [[-.06, .52], [.08, .70], [.22, .86], [.36, 1.0], [.52, .92], [.68, .76], [.84, .58]];
                cols.forEach(([ox, hh]) => {
                    const cw = bw * .155, cx0 = bx + bw * ox, ch = bh * hh, cty = gy - ch;
                    ctx.fillStyle = ink;
                    ctx.fillRect(cx0, cty, cw, ch);
                    ctx.fillRect(cx0 + cw * .2, cty - ch * .03, cw * .6, ch * .03);
                    for (let r = 0; r < 14; r++) {
                        if (R() < .44) continue;
                        ctx.fillStyle = win + (.26 + R() * .5) + ')';
                        ctx.fillRect(cx0 + cw * .24, cty + ch * (.06 + r * .064), cw * .52, ch * .028);
                    }
                });
                ctx.fillStyle = ink;
                ctx.fillRect(bx + bw * .40, gy - bh * 1.02, bw * .06, bh * .06);
                ctx.fillStyle = 'rgba(255,70,70,.95)';
                ctx.beginPath();
                ctx.arc(bx + bw * .43, gy - bh * 1.03, 2.4, 0, 7);
                ctx.fill();
            }
        });
        ctx.restore();
    }

    function drawMilestones() {
        ctx.save();
        ctx.setLineDash([6, 8]);
        ctx.lineWidth = 1.3;
        for (let n = 10; n <= Math.max(60, blocks.length + 20); n += 10) {
            const y = sy(n * BH);
            if (y < -24 || y > H + 24) continue;
            const passed = blocks.length >= n;
            ctx.strokeStyle = passed ? 'rgba(245,180,23,.5)' : 'rgba(255,244,206,.18)';
            ctx.beginPath();
            ctx.moveTo(12, y);
            ctx.lineTo(W - 12, y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.font = '700 11px Quicksand,sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = passed ? 'rgba(245,180,23,.85)' : 'rgba(255,244,206,.35)';
            ctx.fillText(n + ' tầng', 15, y - 4);
            ctx.setLineDash([6, 8]);
        }
        ctx.restore();
    }

    const DEPTH = 44, SINK = 0.95, LOBE = 18, FOOT = 0.18, BEND = 0.55;

    function capR(w) { return Math.min(w / 2, 8 + w * 0.085); }

    function lobeXs(x, w) {
        const n = Math.max(2, Math.round(w / LOBE));
        const a = [];
        for (let j = 0; j <= n; j++) {
            const t = j / n * 2 - 1;
            const f = (1 - BEND) * t + BEND * Math.sin(t * Math.PI / 2);
            a.push(x + w / 2 + f * w / 2);
        }
        return a;
    }

    function scallopRL(xs, yb, ampMax, ry) {
        for (let j = xs.length - 2; j >= 0; j--) {
            const a = Math.min((xs[j + 1] - xs[j]) * 0.40, ampMax);
            ctx.quadraticCurveTo((xs[j] + xs[j + 1]) / 2, yb + a, xs[j], yb - Math.min(a, ampMax * .8));
        }
    }

    function scallopRL2(xs, yb, amp, xL, xR) {
        const inside = xs.filter(v => v > xL && v < xR);
        let px = xR;
        for (let i = inside.length - 1; i >= 0; i--) {
            const bx = inside[i];
            ctx.quadraticCurveTo((px + bx) / 2, yb + amp, bx, yb);
            px = bx;
        }
        ctx.quadraticCurveTo((px + xL) / 2, yb + amp, xL, yb);
    }

    function cakeTop(x, top, w, d, rx, faK) {
        faK = (faK === undefined) ? 1 : faK;
        const xs = lobeXs(x, w);
        const ry = d / 2, L = x, R = x + w, T = top, cx = x + w / 2;
        rx = Math.max(0.01, Math.min(rx, w / 2));
        const bt = Math.min(2.2, w * 0.022);
        const fa = ry * 0.30 * faK;
        ctx.beginPath();
        ctx.moveTo(L, T + ry);
        ctx.bezierCurveTo(L, T + ry * 0.26, L + rx * 0.46, T, L + rx, T);
        ctx.quadraticCurveTo(cx, T - bt, R - rx, T);
        ctx.bezierCurveTo(R - rx * 0.46, T, R, T + ry * 0.26, R, T + ry);
        scallopRL(xs, T + d, fa, ry);
        ctx.closePath();
    }

    function cakeBody(x, top, w, h, rx, ry) {
        const xs = lobeXs(x, w);
        rx = Math.max(0.01, Math.min(rx, w / 2));
        const L = x, R = x + w, T = top, B = top + h, T2 = T + ry, B2 = B - ry, cx = x + w / 2, cy = (T2 + B2) / 2;
        const bt = Math.min(2.2, w * 0.022);
        const bs = Math.min(2.4, h * 0.07);
        const amp = ry * FOOT;
        ctx.beginPath();
        ctx.moveTo(L, T2);
        ctx.bezierCurveTo(L, T2 - ry * 0.74, L + rx * 0.46, T, L + rx, T);
        ctx.quadraticCurveTo(cx, T - bt, R - rx, T);
        ctx.bezierCurveTo(R - rx * 0.46, T, R, T2 - ry * 0.74, R, T2);
        ctx.quadraticCurveTo(R + bs, cy, R, B2);
        ctx.bezierCurveTo(R, B2 + ry * 0.74, R - rx * 0.46, B, R - rx, B);
        if (amp > 0.3) scallopRL2(xs, B, amp, L + rx, R - rx);
        else ctx.quadraticCurveTo(cx, B + bt, L + rx, B);
        ctx.bezierCurveTo(L + rx * 0.46, B, L, B2 + ry * 0.74, L, B2);
        ctx.quadraticCurveTo(L - bs, cy, L, T2);
        ctx.closePath();
    }

    function topEdgeY(fx, x, w, top, d, rx) {
        const ry = d / 2, cx = x + w / 2, flat = Math.max(0, w / 2 - rx);
        const dx = Math.abs(fx - cx);
        if (dx <= flat) return top + d;
        const k = Math.min(1, (dx - flat) / rx);
        return top + ry + ry * Math.sqrt(Math.max(0, 1 - k * k));
    }

    function moldFlower(px, py, R, s, petals) {
        ctx.beginPath();
        ctx.ellipse(px, py, R * .40, R * .40 * s, 0, 0, 7);
        ctx.stroke();
        for (let k = 0; k < petals; k++) {
            const a = k * Math.PI * 2 / petals;
            ctx.beginPath();
            ctx.ellipse(px + Math.cos(a) * R * .70, py + Math.sin(a) * R * .70 * s, R * .27, R * .27 * s, 0, 0, 7);
            ctx.stroke();
        }
        if (R > 8.5) {
            ctx.beginPath();
            ctx.ellipse(px, py, R * 1.06, R * 1.06 * s, 0, 0, 7);
            ctx.stroke();
        }
    }

    function drawCake(b, wy, ghost) {
        const y = sy(wy), top = y - BH;
        if (y < -BH * 3 || top > H + BH * 3) return;
        const c = CFG.cakes[b.cake] || CFG.cakes.nuong;
        const x = b.x, w = b.w;
        const d = Math.min(13, BH * 0.40, w * 0.85);
        const ry = d / 2, rx = capR(w);
        const s = d / DEPTH, cx = x + w / 2, cyT = top + ry;
        const hh = BH + d * SINK;
        const xs = lobeXs(x, w);

        ctx.save();
        if (ghost) ctx.globalAlpha = .97;

        ctx.save();
        ctx.globalAlpha = (ghost ? .97 : 1) * .24;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(cx, top + hh - ry * .7, w / 2 + 1, ry * 1.2, 0, 0, 7);
        ctx.fill();
        ctx.restore();

        cakeBody(x, top, w, hh, rx, ry);
        const g = ctx.createLinearGradient(x, 0, x + w, 0);
        g.addColorStop(0, c.e);
        g.addColorStop(.06, c.b);
        g.addColorStop(.20, c.m);
        g.addColorStop(.42, c.t);
        g.addColorStop(.58, c.t);
        g.addColorStop(.80, c.m);
        g.addColorStop(.94, c.b);
        g.addColorStop(1, c.e);
        ctx.fillStyle = g;
        ctx.fill();

        ctx.save();
        cakeBody(x, top, w, hh, rx, ry);
        ctx.clip();

        for (let j = 0; j < xs.length - 1; j++) {
            const lx = xs[j], lw = xs[j + 1] - xs[j];
            const gl = ctx.createLinearGradient(lx, 0, lx + lw, 0);
            gl.addColorStop(0, 'rgba(0,0,0,.20)');
            gl.addColorStop(.14, 'rgba(0,0,0,.05)');
            gl.addColorStop(.40, 'rgba(255,255,255,.15)');
            gl.addColorStop(.64, 'rgba(255,255,255,.03)');
            gl.addColorStop(.88, 'rgba(0,0,0,.07)');
            gl.addColorStop(1, 'rgba(0,0,0,.20)');
            ctx.fillStyle = gl;
            ctx.fillRect(lx, top, lw + .6, hh);
        }

        const gv = ctx.createLinearGradient(0, top + d * .5, 0, top + hh);
        gv.addColorStop(0, 'rgba(0,0,0,0)');
        gv.addColorStop(.5, 'rgba(0,0,0,.06)');
        gv.addColorStop(1, 'rgba(0,0,0,.26)');
        ctx.fillStyle = gv;
        ctx.fillRect(x, top, w, hh);

        const fh = Math.min(4.2, ry * 0.75);
        const gf = ctx.createLinearGradient(0, top + hh - fh, 0, top + hh);
        gf.addColorStop(0, 'rgba(0,0,0,.20)');
        gf.addColorStop(.55, 'rgba(0,0,0,.06)');
        gf.addColorStop(1, 'rgba(255,255,255,.14)');
        ctx.fillStyle = gf;
        ctx.fillRect(x, top + hh - fh, w, fh);

        const gsh = ctx.createLinearGradient(0, top + d * .5, 0, top + d * .5 + BH * .42);
        gsh.addColorStop(0, 'rgba(255,255,255,.20)');
        gsh.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gsh;
        ctx.fillRect(x, top, w, BH);

        ctx.strokeStyle = 'rgba(255,255,255,.34)';
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = .7;
        ctx.beginPath();
        ctx.moveTo(x + rx * .35, topEdgeY(x + rx * .35, x, w, top, d, rx) - ry * .1);
        ctx.quadraticCurveTo(cx, top + d * 1.02, x + w - rx * .35, topEdgeY(x + w - rx * .35, x, w, top, d, rx) - ry * .1);
        ctx.stroke();
        ctx.globalAlpha = ghost ? .97 : 1;
        ctx.restore();

        ctx.strokeStyle = c.e;
        ctx.lineWidth = 1.2;
        cakeBody(x, top, w, hh, rx, ry);
        ctx.stroke();

        cakeTop(x, top, w, d, rx);
        const gt = ctx.createLinearGradient(0, top, 0, top + d);
        gt.addColorStop(0, c.t);
        gt.addColorStop(1, c.m);
        ctx.fillStyle = gt;
        ctx.fill();
        ctx.strokeStyle = c.e;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (w > 26) {
            ctx.save();
            cakeTop(x, top, w, d, rx);
            ctx.clip();
            ctx.strokeStyle = c.p;
            ctx.globalAlpha = .7;
            ctx.lineWidth = 1;
            cakeTop(x + 3.2, top + d * .15, w - 6.4, d * .70, Math.max(1, rx - 3.2), .45);
            ctx.stroke();
            ctx.restore();
        }

        if (w > 30) {
            const R = Math.min(w * 0.17, DEPTH * 0.30);
            const nf = Math.max(1, Math.min(4, Math.round(w / 58)));
            const gap = Math.min(w / nf * 0.95, 62);
            ctx.save();
            ctx.strokeStyle = c.p;
            ctx.lineWidth = 1;
            ctx.globalAlpha = (ghost ? .97 : 1) * .9;
            if (w > 44) {
                for (let i = 0; i < nf; i++) moldFlower(cx + (i - (nf - 1) / 2) * gap, cyT, R, s, R > 7 ? 6 : 5);
            } else {
                ctx.beginPath();
                ctx.ellipse(cx, cyT, R * .75, R * .75 * s, 0, 0, 7);
                ctx.stroke();
            }
            ctx.restore();
        }

        ctx.save();
        cakeTop(x, top, w, d, rx);
        ctx.clip();
        const gh = ctx.createLinearGradient(x, top, x + w * .7, top + d);
        gh.addColorStop(0, 'rgba(255,255,255,.30)');
        gh.addColorStop(.6, 'rgba(255,255,255,0)');
        ctx.fillStyle = gh;
        ctx.fillRect(x, top, w, d);
        ctx.restore();

        ctx.restore();
    }

    function cloudBand() {
        const h = blocks.length;
        return Math.max(0.1, 1 - Math.abs(h - 14) / 15);
    }

    function updateClouds(dt) {
        dt = dt || 1;
        const band = cloudBand();
        const want = 3 + band * 12;
        if (clouds.length < want && Math.random() < (0.16 + band * 0.4) * dt) {
            const dir = Math.random() < .5 ? 1 : -1;
            clouds.push({
                x: dir > 0 ? -260 : W + 260,
                wy: cam - GROUND + rnd(-140, H + 140),
                s: rnd(.7, 1.9) * (0.75 + band * 0.6),
                sp: dir * rnd(.3, 1.3) * (0.6 + band),
                a: (.3 + Math.random() * .42) * (0.5 + band * 0.8),
                front: Math.random() < 0.38
            });
        }
        clouds.forEach(c => { c.x += c.sp * dt; });
        clouds = clouds.filter(c => c.x > -460 && c.x < W + 460 && sy(c.wy) > -320 && sy(c.wy) < H + 320);
    }

    function drawClouds(front) {
        clouds.forEach(c => {
            if (!!c.front !== front) return;
            const y = sy(c.wy), S0 = c.s;
            ctx.save();
            ctx.globalAlpha = c.a * (front ? 0.78 : 1);
            ctx.fillStyle = front ? 'rgba(248,244,255,.95)' : 'rgba(226,218,252,.92)';
            ctx.beginPath();
            ctx.ellipse(c.x, y, 66 * S0, 19 * S0, 0, 0, 7);
            ctx.ellipse(c.x + 40 * S0, y + 7 * S0, 46 * S0, 15 * S0, 0, 0, 7);
            ctx.ellipse(c.x - 38 * S0, y + 8 * S0, 42 * S0, 14 * S0, 0, 0, 7);
            ctx.ellipse(c.x + 12 * S0, y - 9 * S0, 38 * S0, 14 * S0, 0, 0, 7);
            ctx.fill();
            ctx.restore();
        });
    }

    function drawPulse() {
        const spd = Math.max(0, Math.min(1, (speed - 4.0) / 4.8));
        const wid = cur ? Math.max(0, Math.min(1, 1 - (cur.w / (BASE_W * 0.55)))) : 0;
        const inten = Math.max(spd, wid * 1.15);
        if (inten <= .04) return;
        const danger = wid > spd;
        const col = danger ? '255,70,70' : '255,130,45';
        const p = (Math.sin(performance.now() / ((1.15 - inten * .85) * 380)) + 1) / 2;
        const a = Math.min(.62, inten * (.16 + p * .34));
        const edge = .28;

        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, `rgba(${col},${a})`);
        g.addColorStop(edge, `rgba(${col},0)`);
        g.addColorStop(1 - edge, `rgba(${col},0)`);
        g.addColorStop(1, `rgba(${col},${a})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        const g2 = ctx.createLinearGradient(0, 0, W, 0);
        g2.addColorStop(0, `rgba(${col},${a})`);
        g2.addColorStop(edge, `rgba(${col},0)`);
        g2.addColorStop(1 - edge, `rgba(${col},0)`);
        g2.addColorStop(1, `rgba(${col},${a})`);
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = `rgba(${col},${Math.min(.95, a * 2.2)})`;
        ctx.lineWidth = 2 + inten * 4;
        ctx.strokeRect(1.5, 1.5, W - 3, H - 3);

        if (danger && wid > 0.55) {
            ctx.font = '700 13px Quicksand,sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(255,120,120,${.5 + p * .5})`;
            ctx.fillText('BÁNH SẮP HẾT CHỖ!', W / 2, 26);
        }
    }

    function drawCursor() {
        rip.forEach(r => {
            const k = r.t / r.life, R = 7 + k * 30;
            ctx.save();
            ctx.strokeStyle = `rgba(255,197,60,${(1 - k) * .8})`;
            ctx.lineWidth = 2.6 * (1 - k) + .6;
            ctx.beginPath();
            ctx.arc(r.x, r.y, R, 0, 7);
            ctx.stroke();

            ctx.strokeStyle = `rgba(255,244,206,${(1 - k) * .4})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(r.x, r.y, R * .6, 0, 7);
            ctx.stroke();

            for (let i = 0; i < 6; i++) {
                const a = r.a + i * Math.PI / 3, d = 11 + k * 26;
                ctx.fillStyle = `rgba(255,244,206,${(1 - k) * .85})`;
                ctx.beginPath();
                ctx.arc(r.x + Math.cos(a) * d, r.y + Math.sin(a) * d, 1.9 * (1 - k) + .4, 0, 7);
                ctx.fill();
            }
            ctx.restore();
        });

        if (!mIn || !running) return;

        const now = performance.now();
        const p = Math.max(0, press / 9);
        const sw = Math.sin(now / 620) * 0.075 + p * 0.10;
        const SC = 0.57;

        ctx.save();
        ctx.translate(mX, mY);
        ctx.rotate(sw);
        ctx.scale(SC, SC);

        const RED = '#EE4E44', RED_D = '#C32B27', RED_L = '#FF8079', YEL = '#FFD23F', YEL_D = '#E0A81B';

        const gl = ctx.createRadialGradient(0, 32, 2, 0, 32, 34 + p * 10);
        gl.addColorStop(0, `rgba(255,190,70,${.26 + p * .22})`);
        gl.addColorStop(1, 'rgba(255,190,70,0)');
        ctx.fillStyle = gl;
        ctx.beginPath();
        ctx.arc(0, 32, 34 + p * 10, 0, 7);
        ctx.fill();

        ctx.strokeStyle = RED_D; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 5); ctx.stroke();
        ctx.fillStyle = YEL; ctx.beginPath(); ctx.arc(0, 3.5, 3, 0, 7); ctx.fill();
        ctx.strokeStyle = RED; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(-9, 14); ctx.moveTo(0, 6); ctx.lineTo(9, 14); ctx.stroke();

        ctx.fillStyle = YEL; rr(-11, 13, 22, 6, 3); ctx.fill();
        ctx.fillStyle = YEL_D; rr(-11, 17.4, 22, 1.8, .9); ctx.fill();

        ctx.fillStyle = RED; ctx.beginPath(); ctx.ellipse(0, 32, 15, 15, 0, 0, 7); ctx.fill();
        ctx.fillStyle = RED_D; ctx.beginPath(); ctx.ellipse(6.5, 32, 8.5, 15, 0, 0, 7); ctx.fill();
        ctx.fillStyle = RED_L; ctx.beginPath(); ctx.ellipse(-5, 32, 7, 14.2, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(0, 32, 11, Math.PI * 1.08, Math.PI * 1.45); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(-10, 38.5, 1.9, 0, 7); ctx.fill();

        ctx.fillStyle = YEL; ctx.beginPath(); ctx.arc(1.5, 32, 6.6, 0, 7); ctx.fill();
        ctx.fillStyle = RED;
        for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3 - Math.PI / 2;
            ctx.beginPath(); ctx.ellipse(1.5 + Math.cos(a) * 2.5, 32 + Math.sin(a) * 2.5, 1.55, 1.55, 0, 0, 7); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(1.5, 32, 1.5, 0, 7); ctx.fill();

        ctx.fillStyle = YEL; rr(-11, 45, 22, 6, 3); ctx.fill();
        ctx.fillStyle = YEL_D; rr(-11, 45, 22, 1.8, .9); ctx.fill();
        ctx.strokeStyle = RED; ctx.lineWidth = 2; ctx.lineCap = 'round';
        for (let i = -2; i <= 2; i++) {
            const x = i * 4.6, sway = Math.sin(now / 520 + i) * 1.3 + sw * 7;
            ctx.beginPath(); ctx.moveTo(x, 51); ctx.quadraticCurveTo(x + sway * .5, 55, x + sway, 59.5); ctx.stroke();
        }
        ctx.restore();

        function rr(x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
        }
    }

    function draw() {
        if (!ctx || W < 40 || H < 40) return;
        ctx.clearRect(0, 0, W, H);
        drawSky();
        drawClouds(false);
        drawMilestones();

        winds.forEach(w => {
            if (w.leaf) {
                ctx.save();
                ctx.translate(w.x, w.y);
                ctx.rotate(w.rot);
                ctx.globalAlpha = Math.min(1, w.a * 1.6);
                ctx.fillStyle = '#E8A33C';
                ctx.beginPath();
                ctx.ellipse(0, 0, 7, 3.4, 0, 0, 7);
                ctx.fill();
                ctx.restore();
                ctx.globalAlpha = 1;
            } else {
                const g = ctx.createLinearGradient(w.x, 0, w.x - w.len * Math.sign(w.sp), 0);
                g.addColorStop(0, `rgba(255,250,225,${w.a})`);
                g.addColorStop(1, 'rgba(255,250,225,0)');
                ctx.strokeStyle = g;
                ctx.lineWidth = w.w;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(w.x, w.y);
                ctx.lineTo(w.x - w.len * Math.sign(w.sp), w.y + Math.sign(w.sp) * 3);
                ctx.stroke();
            }
        });

        blocks.forEach((b, i) => drawCake(b, i * BH, false));

        falls.forEach(f => {
            const y = sy(f.y), c = CFG.cakes[f.cake];
            ctx.save();
            ctx.translate(f.x + f.w / 2, y - BH / 2);
            ctx.rotate(f.rot);
            ctx.globalAlpha = .92;
            const g = ctx.createLinearGradient(0, -BH / 2, 0, BH / 2);
            g.addColorStop(0, c.m);
            g.addColorStop(1, c.e);
            ctx.fillStyle = g;
            const fd = Math.min(11, BH * .36, f.w * .85), fr = capR(f.w);
            cakeBody(-f.w / 2, -BH / 2, f.w, BH, fr, fd / 2);
            ctx.fill();
            ctx.strokeStyle = c.e;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            cakeTop(-f.w / 2, -BH / 2, f.w, fd, fr);
            ctx.fillStyle = c.t;
            ctx.globalAlpha = .85;
            ctx.fill();
            ctx.globalAlpha = .92;
            ctx.restore();
        });

        puff.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.l / 28);
            ctx.fillStyle = '#FFD75E';
            ctx.beginPath();
            ctx.arc(p.x, sy(p.y), 2.3, 0, 7);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        if (cur) drawCake(cur, blocks.length * BH, true);
        drawClouds(true);

        const fl = flashT - performance.now();
        if (fl > 0) {
            const b = blocks[blocks.length - 1], y = sy((blocks.length - 1) * BH), k = fl / FLASH_MS;
            const fade = Math.min(1, k * 2.2);
            const cx = b.x + b.w / 2, cy = y - BH / 2, R = (1 - k) * Math.max(b.w, 90) * 1.1 + 16;
            const g = ctx.createRadialGradient(cx, cy, R * .55, cx, cy, R);
            g.addColorStop(0, 'rgba(255,215,94,0)');
            g.addColorStop(.7, `rgba(255,215,94,${fade * .45})`);
            g.addColorStop(1, 'rgba(255,215,94,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
            ctx.font = '700 15px Quicksand,sans-serif';
            ctx.fillStyle = `rgba(255,215,94,${fade})`;
            ctx.textAlign = 'center';
            ctx.fillText(flashMsg || 'KHÍT!', cx, cy - BH * .9 - (1 - k) * 10);
        }

        drawPulse();
        drawCursor();
    }

    /* ================== VÒNG LẶP & ĐIỀU KHIỂN ================== */
    function toStart() {
        running = false;
        cancelAnimationFrame(raf);
        resize();
        reset();
        if (qs('#ovlCd')) qs('#ovlCd').classList.remove('on');
        if (qs('#ovlStart')) qs('#ovlStart').classList.add('on');
        draw();
    }

    async function start() {
        if (S.turns <= 0) {
            toast('Bạn đã hết lượt. Chia sẻ để nhận thêm lượt nhé.');
            return;
        }

        const btnStart = qs('#btnStart');
        if (btnStart) btnStart.disabled = true;

        try {
            // Gọi API startGame theo đúng MinigameSDK
            const res = await sdk.startGame();
            if (!res || !res.success) {
                toast((res && res.msg) || 'Không thể bắt đầu ván chơi!');
                if (btnStart) btnStart.disabled = false;
                return;
            }

            currentPlayToken = (res.data && res.data.play_token) || '';
            if (res.data && typeof res.data.remain_turn !== 'undefined') {
                S.turns = res.data.remain_turn;
                if (qs('#turnN')) qs('#turnN').textContent = S.turns;
            }
        } catch (e) {
            toast('Lỗi kết nối máy chủ!');
            if (btnStart) btnStart.disabled = false;
            return;
        }

        if (qs('#ovlStart')) qs('#ovlStart').classList.remove('on');
        resize();
        reset();
        const ov = qs('#ovlCd');
        if (ov) ov.classList.add('on');
        let n = 3;
        if (qs('#cdN')) qs('#cdN').textContent = n;

        const id = setInterval(() => {
            n--;
            if (n > 0) {
                if (qs('#cdN')) {
                    qs('#cdN').textContent = n;
                    qs('#cdN').style.animation = 'none';
                    void qs('#cdN').offsetWidth;
                    qs('#cdN').style.animation = '';
                }
            } else {
                if (qs('#cdN')) qs('#cdN').textContent = 'XẾP!';
                setTimeout(() => {
                    clearInterval(id);
                    if (ov) ov.classList.remove('on');
                    if (btnStart) btnStart.disabled = false;
                    running = true;
                    document.body.classList.add('playing');
                    lastT = 0;
                    playStartTime = performance.now();
                    raf = requestAnimationFrame(loop);
                }, 400);
            }
        }, 580);
    }

    if (qs('#btnStart')) qs('#btnStart').onclick = start;

    const DEMO_GIF = 'https://support.pavietnam.vn/datafile/banner/2026_09/549316-17091044-demo.gif';
    function openDemo() {
        const im = qs('#demoGif');
        if (im) {
            im.src = '';
            im.src = DEMO_GIF;
        }
        openM('#mDemo');
    }
    if (qs('#btnDemo')) qs('#btnDemo').onclick = openDemo;
    if (qs('#demoPlay')) qs('#demoPlay').onclick = () => { closeM(); };

    if (qs('#btnHelp')) {
        qs('#btnHelp').onclick = () => {
            if (running) return toast('Đang chơi, xem hướng dẫn sau khi hết lượt nhé.');
            if (qs('#ovlStart')) qs('#ovlStart').classList.add('on');
        };
    }

    const stg = qs('#stage');
    if (stg) {
        stg.style.touchAction = 'manipulation';
        const atStage = e => {
            const r = cv.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        };

        stg.addEventListener('pointermove', e => {
            if (e.pointerType === 'touch') return;
            const p = atStage(e);
            mX = p.x; mY = p.y;
            mIn = !e.target.closest('button,a,.ovl');
            stg.classList.add('mcur');
        });

        stg.addEventListener('pointerleave', () => { mIn = false; });

        stg.addEventListener('pointerdown', e => {
            if (e.target.closest('button,a,.ovl')) return;
            if (!running) return;
            e.preventDefault();
            const p = atStage(e);
            mX = p.x; mY = p.y;
            mIn = (e.pointerType !== 'touch') ? true : mIn;
            rip.push({ x: p.x, y: p.y, t: 0, life: 26, a: Math.random() * 6.28 });
            if (rip.length > 6) rip.shift();
            press = 9;
            drop();
        });

        stg.addEventListener('dblclick', e => e.preventDefault());
    }
    addEventListener('keydown', e => { if (e.code === 'Space' && running) { e.preventDefault(); drop(); } });

    /* ================== HIỂN THỊ KẾT QUẢ & MỐC THƯỞNG ================== */
    function bindOpts() {
        qsa('#rGift .opt').forEach(btn => btn.onclick = () => {
            S.pickOpt = btn.dataset.opt;
            qsa('#rGift .opt').forEach(x => {
                const on = x === btn;
                x.classList.toggle('on', on);
                x.classList.toggle('dim', !on);
            });
        });
    }

    function mileOf(sc) {
        if (sc >= CFG.miles[1].min) return CFG.miles[1];
        if (sc >= CFG.miles[0].min) return CFG.miles[0];
        return null;
    }

    function showResult() {
        const sc = S.lastScore, m = mileOf(sc);
        S.lastMile = m;
        if (qs('#rScore')) qs('#rScore').textContent = sc;
        if (qs('#rBee')) qs('#rBee').src = m ? BEE.yay : BEE.hmm;

        if (m) {
            if (qs('#rTitle')) qs('#rTitle').textContent = 'Bạn mở khoá được ưu đãi';
            S.pickOpt = null;
            let g = `<div class="ic">${m.ic}</div><div class="nm">${m.nm}</div><div class="ds">${m.ds}</div>`;
            if (m.opts) {
                g += `<div class="opts"><div class="optlb">Chọn 1 trong 2 ưu đãi:</div>`
                    + m.opts.map(o => `<button class="opt" data-opt="${o.id}">
                        <span class="oi">${o.ic}</span>
                        <span class="ot"><b>${o.nm}</b><span>${o.sub}</span></span>
                        <span class="tick">✓</span></button>`).join('') + `</div>`;
            }
            if (qs('#rGift')) qs('#rGift').innerHTML = g;
            if (m.opts) bindOpts();
            if (qs('#rClaim')) qs('#rClaim').style.display = '';
        } else {
            if (qs('#rTitle')) qs('#rTitle').textContent = 'Tháp bánh sụp mất rồi';
            if (qs('#rGift')) {
                qs('#rGift').innerHTML = `<div class="ic"><img src="/images/kq-chua-dat.jpg" height="34" class="icon_result" /></div><div class="nm">Chưa đủ ${CFG.miles[0].min} tầng</div>
                    <div class="ds">Cố thêm chút nữa là có ưu đãi rồi</div>`;
            }
            if (qs('#rClaim')) qs('#rClaim').style.display = 'none';
        }

        const nx = sc < CFG.miles[0].min ? CFG.miles[0] : (sc < CFG.miles[1].min ? CFG.miles[1] : null);
        const eligible = sc >= MIN_RANK;
        let n1 = '';

        if (!eligible) {
            n1 = `Cần đạt <b>tối thiểu ${MIN_RANK} tầng</b> để ghi danh và nhận ưu đãi. `
                + `Chỉ còn <b>${MIN_RANK - sc} tầng</b> nữa thôi, chơi tiếp nào!`;
        } else if (!S.reg) {
            n1 = `<b>Kỷ lục này chưa được lưu.</b> Ghi danh để vào bảng xếp hạng. `;
            if (nx) n1 += `Thêm <b>${nx.min - sc} tầng</b> là lên mốc tiếp theo.`;
        } else {
            n1 = `Bạn vừa xếp được <b>${sc} tầng</b>. `;
            if (nx) n1 += `Thêm <b>${nx.min - sc} tầng</b> là lên mốc tiếp theo.`;
            n1 += `<br>Kỷ lục hôm nay <b>${S.best} tầng</b>. `;
        }
        if (qs('#rNote')) qs('#rNote').innerHTML = n1;

        if (qs('#rClaim')) {
            qs('#rClaim').style.display = eligible ? '' : 'none';
            if (eligible) {
                qs('#rClaim').textContent = S.reg
                    ? (m ? 'Nhận mã ưu đãi' : 'Cập nhật kỷ lục')
                    : (m ? 'Nhận ưu đãi & ghi danh' : `${ic(ICONS.note)} Ghi danh kỷ lục`);
            }
        }
        if (qs('#rAgain')) {
            qs('#rAgain').textContent = S.turns > 0
                ? (eligible ? 'Chơi tiếp' : 'Chơi tiếp để đạt thứ hạng cao hơn')
                : 'Hết lượt, chia sẻ để thêm lượt';
        }

        openM('#mRes');
    }

    if (qs('#rAgain')) {
        qs('#rAgain').onclick = () => {
            closeM();
            if (S.turns > 0) toStart();
            else toast('Hết lượt rồi. Chia sẻ Facebook hoặc Zalo để nhận thêm lượt.');
        };
    }

    if (qs('#rClaim')) {
        qs('#rClaim').onclick = () => {
            const m0 = S.lastMile;
            if (m0 && m0.opts && !S.pickOpt) {
                toast('Vui lòng chọn 1 trong 2 ưu đãi trước khi nhận.');
                return;
            }
            if (!S.reg) {
                openJoin();
                return;
            }
            if (qs('#fSend')) qs('#fSend').click();
        };
    }
})();

