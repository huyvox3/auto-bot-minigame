
/**
 * Social Share Library (V2.0)
 * Facebook, Messenger, Zalo (SDK & Web Popup), Telegram, Viber
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.SocialShare = factory());
})(this, function () {
    'use strict';

    class SocialShare {
        constructor(options) {
            this.config = Object.assign({
                url: window.location.href,
                defaultHashtag: '',
                fbAppId: '',
                zaloOaId: '',
                autoLoadZaloSdk: true,
                onShared: function (channel, meta) {}
            }, options || {});

            if (this.config.autoLoadZaloSdk && this.config.zaloOaId) {
                this._injectZaloSdk();
            }
        }

        _isMobile() {
            return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
        }

        _injectZaloSdk() {
            if (!document.getElementById('zalo-social-sdk')) {
                const script = document.createElement('script');
                script.id = 'zalo-social-sdk';
                script.src = 'https://sp.zalo.me/plugins/sdk.js';
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }
        }

        _formatHashtag(tag) {
            if (!tag) return '';
            let clean = tag.trim();
            if (!clean.startsWith('#')) clean = '#' + clean;
            return clean.replace(/\s+/g, '_');
        }

        _buildShareUrl(customUrl, score) {
            const rawUrl = customUrl || this.config.url;
            const urlObj = new URL(rawUrl, window.location.origin);
            if (score !== undefined && score !== null) {
                urlObj.searchParams.set('score', score);
            }
            return urlObj.toString();
        }

        _openDesktopPopup(endpoint, channel, meta) {
            const w = 600, h = 520;
            const left = Math.max(0, (window.innerWidth - w) / 2 + window.screenX);
            const top = Math.max(0, (window.innerHeight - h) / 2 + window.screenY);

            const popup = window.open(
                endpoint,
                `pa_share_${channel}_${Date.now()}`,
                `width=${w},height=${h},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
            );

            if (!popup) {
                window.open(endpoint, '_blank');
                this._dispatchReward(channel, meta);
                return;
            }

            popup.focus();
            let fired = false;
            const checkTimer = setInterval(() => {
                if (!popup || popup.closed) {
                    clearInterval(checkTimer);
                    if (!fired) {
                        fired = true;
                        this._dispatchReward(channel, meta);
                    }
                }
            }, 600);
        }

        _trackMobileAppReturn(channel, meta) {
            let triggered = false;
            const onFocusBack = () => {
                window.removeEventListener('focus', onFocusBack);
                document.removeEventListener('visibilitychange', onVisibilityChange);
                if (!triggered) {
                    triggered = true;
                    this._dispatchReward(channel, meta);
                }
            };

            const onVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    onFocusBack();
                }
            };

            setTimeout(() => {
                window.addEventListener('focus', onFocusBack);
                document.addEventListener('visibilitychange', onVisibilityChange);
            }, 1200);
        }

        // Đổi tên hàm lắng nghe dùng chung cho cả PC (chuyển tab) và Mobile (chuyển app)
        _trackTabReturn(channel, meta) {
            let triggered = false;
            const onFocusBack = () => {
                window.removeEventListener('focus', onFocusBack);
                document.removeEventListener('visibilitychange', onVisibilityChange);
                if (!triggered) {
                    triggered = true;
                    this._dispatchReward(channel, meta);
                }
            };

            const onVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    onFocusBack();
                }
            };

            // Trì hoãn 1.2s trước khi bắt đầu lắng nghe để tránh kích hoạt ngay lúc click mở tab
            setTimeout(() => {
                window.addEventListener('focus', onFocusBack);
                document.addEventListener('visibilitychange', onVisibilityChange);
            }, 1200);
        }

        _dispatchReward(channel, meta) {
            if (typeof this.config.onShared === 'function') {
                this.config.onShared(channel, meta || {});
            }
        }

        shareFacebook(opts) {
            opts = opts || {};
            const shareUrl = this._buildShareUrl(opts.url, opts.score);
            const hashtag = opts.hashtag || this.config.defaultHashtag;

            let endpoint = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
            if (hashtag) {
                endpoint += `&hashtag=${encodeURIComponent(hashtag)}`;
            }
            this._openDesktopPopup(endpoint, 'facebook', { url: shareUrl, hashtag: hashtag });
        }

        shareMessenger(opts) {
            opts = opts || {};
            const shareUrl = this._buildShareUrl(opts.url, opts.score);

            if (this._isMobile()) {
                window.location.href = `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`;
                this._trackMobileAppReturn('messenger', { url: shareUrl });
            } else {
                if (this.config.fbAppId) {
                    const endpoint = `https://www.facebook.com/dialog/send?app_id=${this.config.fbAppId}&link=${encodeURIComponent(shareUrl)}&redirect_uri=${encodeURIComponent(shareUrl)}`;
                    this._openDesktopPopup(endpoint, 'messenger', { url: shareUrl });
                } else {
                    this.shareFacebook(opts);
                }
            }
        }

        shareZalo(opts) {
            opts = opts || {};
            const targetUrl = opts.url || this.config.zaloOaUrl || 'https://zalo.me/3610449719704001474';

            // 1. Mở tab mới
            const newTab = window.open(targetUrl, '_blank');

            // Dự phòng nếu trình duyệt chặn popup
            if (!newTab) {
                window.location.href = targetUrl;
                return;
            }

            // 2. Theo dõi khi người dùng chuyển tab/app và quay lại trang game để cộng lượt
            this._trackTabReturn('zalo', { url: targetUrl });
        }

        shareTelegram(opts) {
            opts = opts || {};
            const shareUrl = this._buildShareUrl(opts.url, opts.score);
            const text = encodeURIComponent(opts.title || opts.hashtag || this.config.defaultHashtag);
            const endpoint = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`;

            if (this._isMobile()) {
                window.location.href = endpoint;
                this._trackMobileAppReturn('telegram', { url: shareUrl });
            } else {
                this._openDesktopPopup(endpoint, 'telegram', { url: shareUrl });
            }
        }

        shareViber(opts) {
            opts = opts || {};
            const shareUrl = this._buildShareUrl(opts.url, opts.score);
            const text = encodeURIComponent((opts.title || opts.hashtag || this.config.defaultHashtag) + ' ' + shareUrl);
            window.location.href = `viber://forward?text=${text}`;
            this._trackMobileAppReturn('viber', { url: shareUrl });
        }

        share(channel, opts) {
            switch ((channel || '').toLowerCase()) {
                case 'facebook':  return this.shareFacebook(opts);
                case 'messenger': return this.shareMessenger(opts);
                case 'zalo':      return this.shareZalo(opts);
                case 'telegram':  return this.shareTelegram(opts);
                case 'viber':     return this.shareViber(opts);
                default:
                    console.warn(`[PASocialShare] Kênh '${channel}' không hỗ trợ`);
            }
        }

        bindAuto(containerSelector, getDynamicOpts) {
            const container = document.querySelector(containerSelector || 'body');
            if (!container) return;

            const buttons = container.querySelectorAll('[data-share]');
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const channel = btn.getAttribute('data-share');
                    const dynamicOpts = typeof getDynamicOpts === 'function' ? getDynamicOpts(channel) : {};
                    dynamicOpts.element = btn;
                    this.share(channel, dynamicOpts);
                });
            });
        }
    }

    return SocialShare;
});

