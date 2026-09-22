/* ================== QUẢN LÝ ICON / HÌNH ẢNH ==================
   Bạn có thể để emoji hoặc điền link ảnh PNG/SVG vào đây.
   Ví dụ: gift: 'assets/gift.png' hoặc gift: '🎁'
*/
const ICONS = {
  gift:      '🎁',        // Ưu đãi tiêu chuẩn
  mooncake:  `<svg viewBox="0 0 64 64" width="100%" height="100%"><g fill="#F39C12" stroke="#B9770E" stroke-width="1.5"><circle cx="32" cy="12" r="8"/><circle cx="46" cy="18" r="8"/><circle cx="52" cy="32" r="8"/><circle cx="46" cy="46" r="8"/><circle cx="32" cy="52" r="8"/><circle cx="18" cy="46" r="8"/><circle cx="12" cy="32" r="8"/><circle cx="18" cy="18" r="8"/><circle cx="32" cy="32" r="23"/></g><circle cx="32" cy="32" r="16" fill="none" stroke="#B9770E" stroke-width="2.5"/><circle cx="32" cy="32" r="6" fill="#F8C471" stroke="#B9770E" stroke-width="2"/><path d="M32 16 L32 26 M32 38 L32 48 M16 32 L26 32 M38 32 L48 32" stroke="#B9770E" stroke-width="2.5" stroke-linecap="round"/></svg>`,        // Ưu đãi cao cấp
  tag:       '🏷️',        // Giảm giá 50k
  domain:    '🌐',        // Tên miền .io.vn
  moon:      '🌙',        // Tháp bánh sụp / Chưa đạt mốc
  rank1:     '🥇',        // Top 1
  rank2:     '🥈',        // Top 2
  rank3:     '🥉',        // Top 3
  facebook:  '📘',        // Nút chia sẻ Facebook
  zalo:      '💬',        // Nút chia sẻ Zalo
  time:      '⏳',        // Đang diễn ra
  done:      '✅',        // Đã kết thúc
  note:      '📝',        // Ghi danh
  check:     `<svg viewBox="0 0 64 64" width="100%" height="100%"><rect x="10" y="8" width="38" height="48" rx="5" fill="#ECEFF1"/><path d="M18 20 L36 20 M18 28 L32 28 M18 36 L28 36" stroke="#90A4AE" stroke-width="3" stroke-linecap="round"/><g transform="rotate(45 42 36)"><rect x="36" y="24" width="8" height="24" rx="2" fill="#FFA000"/><polygon points="36,48 44,48 40,55" fill="#FFE082"/><polygon points="39,53 41,53 40,55" fill="#212121"/><rect x="36" y="22" width="8" height="3" fill="#E53935"/></g></svg>`          // Dấu tick chọn
};

/* Hàm render icon: tự bọc span cân đối dòng, tự hỗ trợ cả SVG, ảnh PNG và Emoji */
function ic(val, size = '1.25em') {
  if (!val) return '';
  const str = String(val).trim();
  // 1. Trường hợp là SVG inline
  if (str.startsWith('<svg')) {
    return `<span class="game-ic" style="width:${size};height:${size};display:inline-flex;align-items:center;justify-content:center;vertical-align:-0.22em;flex-shrink:0;">${str}</span>`;
  }
  // 2. Trường hợp là file ảnh (PNG, WEBP, SVG ngoài)
  if (str.startsWith('data:image') || /\.(png|jpe?g|svg|webp)($|\?)/i.test(str)) {
    return `<img src="${str}" class="game-ic" style="width:${size};height:${size};vertical-align:-0.22em;display:inline-block;object-fit:contain;" alt="icon">`;
  }
  // 3. Trường hợp là ký tự Emoji
  return str;
} 
