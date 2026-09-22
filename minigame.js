/**
 * PA Minigame SDK - Core Client Library (V2.2 - Multi-Campaign & Safe Session)
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MinigameSDK = factory());
})(this, function () {
    'use strict';

    class MinigameSDK {
        /**
         * @param {Object} config
         * @param {string} config.campaignCode - Mã chiến dịch (bắt buộc, vd: '30_04')
         * @param {string} [config.actionBase] - Đường dẫn gốc (mặc định: '/ajax/minigame')
         */
        constructor(config) {
            if (!config || !config.campaignCode) {
                throw new Error('[MinigameSDK] Thiếu tham số bắt buộc: campaignCode');
            }
            this.lang = config.lang || 'vn';
            this.campaignCode = config.campaignCode;
            this.actionBase   = (config.actionBase || '/'+this.lang+'/minigame.html').replace(/\/+$/, '');

            this.storageUserKey    = 'pa_user_' + this.campaignCode;
            this.storageSessionKey = 'pa_sess_' + this.campaignCode;

            this.userToken           = localStorage.getItem(this.storageUserKey) || '';
            this.sessionSigningToken = localStorage.getItem(this.storageSessionKey) || '';
            this.gameStartTime       = 0;
        }

        // ======================== PRIVATE METHODS ========================

        _getHardwareFingerprint() {
            const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
            const hardware = `${navigator.hardwareConcurrency || 0}_${navigator.deviceMemory || 0}`;
            let gpu = 'no_gpu';
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (gl) {
                    const ext = gl.getExtension('WEBGL_debug_renderer_info');
                    if (ext) gpu = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
                }
            } catch (e) {}
            return `${screenInfo}|${hardware}|${gpu}|${navigator.userAgent}`;
        }

        /**
         * Băm SHA-256 tự động: Ưu tiên Native Web Crypto -> Fallback Pure JS độc lập
         * Chạy tốt trên cả HTTP, IP nội bộ và các Webview không có SSL
         */
        async _sha256(message) {
            // 1. Nếu có Web Crypto API (Môi trường HTTPS / Localhost)
            if (window.crypto && window.crypto.subtle && window.TextEncoder) {
                try {
                    const msgBuffer = new TextEncoder().encode(message);
                    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
                    return Array.from(new Uint8Array(hashBuffer))
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join('');
                } catch (e) {
                    // Fallback nếu Web Crypto bị lỗi quyền truy cập
                }
            }

            // 2. Nếu có nhúng sẵn CryptoJS từ ngoài
            if (typeof CryptoJS !== 'undefined' && CryptoJS.SHA256) {
                return CryptoJS.SHA256(message).toString();
            }
            console.log(message);
            // 3. CỨU CÁNH: Tự tính toán bằng Pure JS (Chạy được trên mọi trình duyệt, kể cả HTTP)
            return this._pureJsSha256(message);
        }

        /**
         * Thuật toán SHA-256 thuần viết bằng JavaScript
         */
        _pureJsSha256(ascii) {
            function rightRotate(value, amount) {
                return (value >>> amount) | (value << (32 - amount));
            }

            // Chuẩn hóa UTF-8 để hỗ trợ cả tiếng Việt có dấu
            ascii = unescape(encodeURIComponent(ascii));
            const asciiBitLength = ascii.length * 8;

            const words = [];
            for (let i = 0; i < ascii.length; i++) {
                words[i >> 2] |= ascii.charCodeAt(i) << (24 - (i % 4) * 8);
            }
            words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
            words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

            let hash = [
                0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
                0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
            ];

            const k = [
                0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
                0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
                0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
                0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
                0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
                0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
            ];

            for (let i = 0; i < words.length; i += 16) {
                const w = words.slice(i, i + 16);
                const oldHash = hash.slice(0);

                for (let j = 0; j < 64; j++) {
                    const w15 = w[j - 15], w2 = w[j - 2];
                    const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
                    const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
                    w[j] = j < 16 ? w[j] : (w[j - 16] + s0 + w[j - 7] + s1) | 0;

                    const s1_maj = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
                    const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
                    const temp1 = (hash[7] + s1_maj + ch + k[j] + w[j]) | 0;

                    const s0_maj = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
                    const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
                    const temp2 = (s0_maj + maj) | 0;

                    hash = [(temp1 + temp2) | 0].concat(hash);
                    hash[4] = (hash[4] + temp1) | 0;
                    hash.pop();
                }

                for (let j = 0; j < 8; j++) {
                    hash[j] = (hash[j] + oldHash[j]) | 0;
                }
            }

            let result = '';
            for (let i = 0; i < 8; i++) {
                for (let j = 3; j >= 0; j--) {
                    const b = (hash[i] >> (j * 8)) & 255;
                    result += ((b < 16) ? '0' : '') + b.toString(16);
                }
            }
            return result;
        }

        async _callAction(actionName, params, isInit) {
            if (!params) params = {};
            params.campaign_code = this.campaignCode;

            const timestamp = Date.now().toString();

            // 1. Sắp xếp key theo alphabet
            const sortedKeys = Object.keys(params).sort();

            // 2. Tạo chuỗi Key-Value phẳng (không dùng JSON.stringify để tránh lệch format)
            const kvPairs = [];
            sortedKeys.forEach(k => {
                if (params[k] !== undefined && params[k] !== null) {
                    kvPairs.push(`${k}=${params[k]}`);
                }
            });

            // Ký số: Init ký bằng salt rỗng; Các action khác ký bằng sessionSigningToken từ Server
            const signKey = isInit ? '' : this.sessionSigningToken;
            const rawString = kvPairs.join('&') + '&ts=' + timestamp + '&key=' + signKey;
            const signature = await this._sha256(rawString);
            const res = await fetch(`${this.actionBase}?step=${actionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Timestamp': timestamp,
                    'X-Signature': signature,
                    'X-User-Token': this.userToken
                },
                body: JSON.stringify(params)
            });
            const data = await res.json();
            return {
                ...data,
                httpStatus: res.status
            };
        }

        // ======================== PUBLIC APIS ========================

        /**
         * [API 1]: Khởi tạo phiên chơi / Định danh người chơi
         */
        async init() {
            const res = await this._callAction('init', {
                user_token: this.userToken,
                raw_fingerprint: this._getHardwareFingerprint()
            }, true);
            if (res.success && res.data) {
                this.userToken           = res.data.user_token;
                this.sessionSigningToken = res.data.session_signing_token;

                localStorage.setItem(this.storageUserKey, this.userToken);
                localStorage.setItem(this.storageSessionKey, this.sessionSigningToken);
            }
            return res;
        }

        /**
         * [API 2]: Bắt đầu lượt chơi
         */
        async startGame() {
            const res = await this._callAction('play', {
                action: 'start',
                user_token: this.userToken
            }, false);

            if (res.success) {
                // Bắt đầu bấm giờ chính xác phía client
                this.gameStartTime = performance.now();
            }
            return res;
        }

        /**
         * [API 3]: Kết thúc ván chơi & Gửi điểm số
         * Tự động đo và gửi client_duration theo mili-giây
         */
        async finishGame(playToken, score, customDuration) {
            let duration = customDuration;
            if (!duration && this.gameStartTime > 0) {
                duration = ((performance.now() - this.gameStartTime) / 1000).toFixed(2);
            }

            return await this._callAction('play', {
                action: 'finish',
                play_token: playToken,
                score: parseInt(score, 10),
                client_duration: parseFloat(duration || 0)
            }, false);
        }

        /**
         * [API 4]: Nhận Voucher hoặc Ghi danh BXH
         * @param {Object} opts
         * @param {number} opts.playId - ID lượt chơi từ finishGame
         * @param {string} opts.email  - Email nhận quà
         * @param {string} [opts.name] - Họ tên
         * @param {string} [opts.voice]- Số điện thoại
         * @param {number} opts.type   - 1: Tiêu chuẩn, 2: Cao cấp, 3: BXH
         */
        async claimReward(opts) {
            return await this._callAction('claim', {
                play_id: opts.playId,
                email: opts.email,
                name: opts.name || 'Khách hàng',
                voice: opts.voice || '',
                type: opts.type,
                reward_options: opts.reward_options || ''
            }, false);
        }

        /**
         * [API 5]: Chia sẻ mạng xã hội nhận thêm lượt
         * @param {'facebook'|'zalo'|'messenger'} channel
         */
        async share(channel) {
            return await this._callAction('share', {
                user_token: this.userToken,
                channel: channel
            }, false);
        }

        /**
         * Lấy danh sách Bảng xếp hạng trong ngày
         */
        async getRanking(date) {
            const url = `${this.actionBase}?step=ranking&campaign_code=${this.campaignCode}&date=${date || ''}&user_token=${this.userToken}`;
            const res = await fetch(url, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            return await res.json();
        }

        async getRankingGrand() {
            const url = `${this.actionBase}?step=ranking-grand&campaign_code=${this.campaignCode}&user_token=${this.userToken}`;
            const res = await fetch(url, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            return await res.json();
        }

        /**
         * Lấy danh sách Người thắng cuộc qua các ngày
         */
        async getWinners() {
            const url = `${this.actionBase}?step=winners&campaign_code=${this.campaignCode}&user_token=${this.userToken}`;
            const res = await fetch(url, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            return await res.json();
        }
    }

    return MinigameSDK;
});