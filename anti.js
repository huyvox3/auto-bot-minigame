/**
 * Anti-Inspect Passive Deterrent (V2.2 - Safe UX)
 * Chặn các phím tắt phổ thông xem mã nguồn và chuột phải.
 */
(function () {
    'use strict';

    // 1. Chặn menu chuột phải
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    }, true);

    // 2. Chặn kéo thả hình ảnh / nội dung ra ngoài
    document.addEventListener('dragstart', function (e) {
        e.preventDefault();
        return false;
    });

    // 3. Chặn các tổ hợp phím tắt: F12, Ctrl+U, Ctrl+S, Ctrl+Shift+I/J/C
    document.addEventListener('keydown', function (e) {
        const isCmdOrCtrl = e.ctrlKey || e.metaKey; // Hỗ trợ cả Windows và macOS
        const keyCode = e.keyCode || e.which;

        // F12
        if (keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        if (isCmdOrCtrl) {
            // Ctrl + U (Xem page source)
            if (keyCode === 85) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl + S (Lưu trang web)
            if (keyCode === 83) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl + Shift + I (Inspect Element)
            // Ctrl + Shift + J (Developer Console)
            // Ctrl + Shift + C (Inspect Selector)
            if (e.shiftKey && (keyCode === 73 || keyCode === 74 || keyCode === 67)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    }, true);

    const threshold = 160;
    setInterval(function () {
        const devtoolsOpened =
            window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold;

        if (devtoolsOpened) {
            document.body.innerHTML = '';
            window.location.reload();
        }
    }, 1000);

    // Anti debug
    setInterval(function () {
        debugger;
    }, 1500);

    // Clear console định kỳ
    setInterval(function () {
        if (window.console && console.clear) {
            console.clear();
        }
    }, 2000);
})();