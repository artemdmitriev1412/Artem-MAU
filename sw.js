// Service Worker: офлайн-оболочка приложения.
const VERSION = "2026.11.16";
const SHELL_CACHE = `mcw-shell-${VERSION}`;
const RUNTIME_CACHE = `mcw-runtime-${VERSION}`;
const NETWORK_TIMEOUT = 4000;

// Всё, что нужно для запуска игры без сети.
const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./css/core.css",
  "./css/wheel.css",
  "./css/clicker.css",
  "./css/controls.css",
  "./css/overlays.css",
  "./css/menu.css",
  "./css/craft.css",
  "./css/furnace.css",
  "./css/shop.css",
  "./css/offers.css",
  "./css/updates.css",
  "./css/responsive.css",
  "./css/admin.css",
  "./css/effects.css",
  "./js/effects/touch.js",
  "./js/admin-vault.js",
  "./js/core/utils.js",
  "./js/data/items.js",
  "./js/core/state.js",
  "./js/core/save.js",
  "./js/core/sound.js",
  "./js/features/events.js",
  "./js/core/cloud.js",
  "./js/features/wheel.js",
  "./js/features/clicker.js",
  "./js/features/craft.js",
  "./js/features/furnace.js",
  "./js/features/chest.js",
  "./js/features/economy.js",
  "./js/features/offers.js",
  "./js/data/updates.js",
  "./js/features/updates.js",
  "./js/core/version-check.js",
  "./js/ui/menu.js",
  "./js/ui/icons.js",
  "./js/admin/admin.js",
  "./js/main.js",
  "./js/effects/tap.js",
  "./assets/img/coin.png",
  "./assets/img/dirt.png",
  "./assets/img/deco/chest.png",
  "./assets/img/deco/eapple.png",
  "./assets/img/deco/furnace.png",
  "./assets/img/deco/table.png",
  "./assets/img/items/amet.png",
  "./assets/img/items/apple.png",
  "./assets/img/items/bedrock.png",
  "./assets/img/items/blaze.png",
  "./assets/img/items/blazep.png",
  "./assets/img/items/brick.png",
  "./assets/img/items/charcoal.png",
  "./assets/img/items/coal.png",
  "./assets/img/items/coalblock.png",
  "./assets/img/items/coalore.png",
  "./assets/img/items/cobble.png",
  "./assets/img/items/copper.png",
  "./assets/img/items/copperore.png",
  "./assets/img/items/cublock.png",
  "./assets/img/items/dblock.png",
  "./assets/img/items/debris.png",
  "./assets/img/items/dia.png",
  "./assets/img/items/diaore.png",
  "./assets/img/items/dirt.png",
  "./assets/img/items/dpick.png",
  "./assets/img/items/dsword.png",
  "./assets/img/items/eblock.png",
  "./assets/img/items/egg.png",
  "./assets/img/items/em.png",
  "./assets/img/items/emore.png",
  "./assets/img/items/eye.png",
  "./assets/img/items/gapple.png",
  "./assets/img/items/gblock.png",
  "./assets/img/items/glass.png",
  "./assets/img/items/gold.png",
  "./assets/img/items/goldore.png",
  "./assets/img/items/gunp.png",
  "./assets/img/items/iblock.png",
  "./assets/img/items/ipick.png",
  "./assets/img/items/iron.png",
  "./assets/img/items/ironore.png",
  "./assets/img/items/isword.png",
  "./assets/img/items/lapblock.png",
  "./assets/img/items/lapis.png",
  "./assets/img/items/lapisore.png",
  "./assets/img/items/log.png",
  "./assets/img/items/nblock.png",
  "./assets/img/items/neth.png",
  "./assets/img/items/obs.png",
  "./assets/img/items/pearl.png",
  "./assets/img/items/planks.png",
  "./assets/img/items/qblock.png",
  "./assets/img/items/quartz.png",
  "./assets/img/items/quartzore.png",
  "./assets/img/items/red.png",
  "./assets/img/items/redblock.png",
  "./assets/img/items/redore.png",
  "./assets/img/items/sand.png",
  "./assets/img/items/scrap.png",
  "./assets/img/items/spick.png",
  "./assets/img/items/ssword.png",
  "./assets/img/items/stick.png",
  "./assets/img/items/tnt.png",
  "./assets/img/items/torch.png",
  "./assets/img/items/wpick.png",
  "./assets/img/items/wsword.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // addAll падает целиком из-за одного файла, поэтому кэшируем по одному.
      await Promise.all(
        SHELL.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: "reload" }));
          } catch (e) {
            console.warn("[sw] не удалось закэшировать", url, e);
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Проверка версии всегда должна идти в сеть, иначе офлайн
  // можно показать обновление, которое невозможно установить.
  if (url.pathname.endsWith("/version.json")) return;

  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req, SHELL_CACHE, "./index.html"));
    return;
  }

  const isRemoteFeed =
    url.hostname === "raw.githubusercontent.com" ||
    url.hostname === "cdn.jsdelivr.net" ||
    url.hostname.endsWith(".githubusercontent.com");

  if (isRemoteFeed) {
    event.respondWith(networkFirst(req, RUNTIME_CACHE, null, true));
    return;
  }

  if (url.origin === self.location.origin) {
    if (req.destination === "image" || req.destination === "font") {
      event.respondWith(cacheFirst(req, SHELL_CACHE));
    } else {
      event.respondWith(networkFirst(req, SHELL_CACHE));
    }
  }
});

async function networkFirst(req, cacheName, fallbackUrl, ignoreSearch = false) {
  const cache = await caches.open(cacheName);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), NETWORK_TIMEOUT);

  try {
    const res = await fetch(req, { signal: ctrl.signal });
    if (res && res.ok) await cache.put(req, res.clone());
    return res;
  } catch (e) {
    const cached = await cache.match(req, { ignoreSearch });
    if (cached) return cached;

    if (fallbackUrl) {
      const shell = await caches.match(fallbackUrl);
      if (shell) return shell;
    }

    return Response.error();
  } finally {
    clearTimeout(timer);
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;

  const res = await fetch(req);
  if (res && res.ok) await cache.put(req, res.clone());
  return res;
}
