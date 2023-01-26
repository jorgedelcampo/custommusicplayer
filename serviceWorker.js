const staticMediaPlayer = "custom-media-player-v1"
const assets = [
  "/",
  "/index.html",
  "/assets/css/style.css",
  "/assets/js/app.js",
  "/assets/img/cassette.png",
  "/assets/img/icon.svg",
  "/assets/img/noise.png",
  "/assets/img/vinyl.svg",
  "/assets/svg/add.svg",
  "/assets/svg/list.svg",
  "/assets/svg/media-control-next.svg",
  "/assets/svg/media-control-pause.svg",
  "/assets/svg/media-control-play.svg",
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticMediaPlayer).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    )
  });

self.addEventListener('activate', function(event) {
    event.waitUntil(caches.keys().then(function(names) {
        return Promise.all(
            names.filter(function(name) {
                return name !== cacheName;
            }).map(function(name) {
                return caches.delete(name);
            })
        );
    }).then(function() {
        return self.clients.claim();
    }));
});
