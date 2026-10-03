/* HARCASSAVA — giữ một bản của app trong máy để mở được khi mất mạng.
   Đặt file này cùng thư mục với trang app trên GitHub Pages.
   Có mạng: luôn lấy bản mới nhất. Mất mạng hoặc mạng quá chậm: dùng bản đã lưu. */
const CACHE = 'harcassava-shell-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;  // Google Sheet, phông chữ: đi thẳng ra mạng
  const fromNet = fetch(req).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  });
  const fromCache = () => caches.match(req, { ignoreSearch: true });
  const slow = new Promise(resolve => setTimeout(resolve, 4000)).then(fromCache);
  e.respondWith(
    Promise.race([fromNet.catch(() => null), slow])
      .then(r => r || fromCache())
      .then(r => r || fromNet)
  );
});
