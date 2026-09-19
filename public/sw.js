var CACHE = 'safar-v2';
var CORE = ['/', '/place.html', '/cover.jpg', '/jeeza-home.jpg', '/manifest.json'];
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(CORE); }).then(function() { return self.skipWaiting(); })
  );
});
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(function(r) {
        var copy = r.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, copy); });
        return r;
      }).catch(function() { return caches.match(e.request).then(function(m) { return m || caches.match('/'); }); })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(hit) {
      var net = fetch(e.request).then(function(r) {
        if (r && r.status === 200) {
          var copy = r.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, copy); });
        }
        return r;
      }).catch(function() { return hit; });
      return hit || net;
    })
  );
});
