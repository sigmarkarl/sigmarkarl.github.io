'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"google-play-badge-crop.png": "9f92fd1f8a48de94f49a8cd1e953ca90",
"black.svg": "2928664fe1fc6aca88583a6f606d60ba",
"version.json": "62cca77dfdcf90f0f420a79a2f64aae1",
"help.html": "e1f06f3988d49d6a6b77b6693f58fdf8",
"index.html": "9f1620d1224ea1bfaa3aa5aebf1762d2",
"/": "9f1620d1224ea1bfaa3aa5aebf1762d2",
"pre-order-on-white.svg": "b9be8b192b0ab1a850e3fed4512d58dd",
"cov19.tre": "89589cca39f4b789735d9d20ab63ece3",
"main.dart.js": "0f53d08ca589efe457ac88018abb5ebf",
"ss2.png": "eca7fe82ca07c2af9b202c8506bc9987",
"flutter.js": "7d69e653079438abfbb24b82a655b0a4",
"app-ads.txt": "98ab85ca40729895e86126bcd5613b43",
"ss.png": "83552b28102e40f43c19618e50074ad9",
"google-play-badge.png": "9f92fd1f8a48de94f49a8cd1e953ca90",
"favicon.png": "3d80987f675cbde2fc2da2ca6839268b",
"menu.png": "a030c8427617662dd762d97be15f02c0",
"white.svg": "0f3514a45d51f95167e5fe8b6a03bb60",
"icons/Icon-192.png": "0fec2765a457a970d47c5c5cb2b281e3",
"icons/Icon-maskable-192.png": "0fec2765a457a970d47c5c5cb2b281e3",
"icons/Icon-maskable-512.png": "163fefb52fa9d7e3305a30491a9d8227",
"icons/Icon-512.png": "163fefb52fa9d7e3305a30491a9d8227",
"pre-order-on-black.svg": "9a04784ef9b4724707e3d27b630b784e",
"manifest.json": "772ea92a515bce79179dd6e310cc4143",
"cov19_pca.tsv": "067ca804ed3a9a29c5eaa9739e41522c",
"newick.png": "577ce52117b52176627bed1c5481fab0",
"assets/images/black.svg": "2928664fe1fc6aca88583a6f606d60ba",
"assets/images/icon.png": "8b4b927af35154f04430b3ac253e1331",
"assets/images/google-play-badge.png": "9f92fd1f8a48de94f49a8cd1e953ca90",
"assets/images/favicon.png": "5dcef449791fa27946b3d35ad8803796",
"assets/images/icon_noalpha.png": "376d7ced648054f0080bf3421709cc45",
"assets/AssetManifest.json": "0670fc79e4f91461c85a7faf79d0515a",
"assets/NOTICES": "f1822ba0acd08b4ad8be0f2220ad5499",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/AssetManifest.bin.json": "abbdb3c07334594e23a3539cb9f720c0",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "89ed8f4e49bcdfc0b5bfc9b24591e347",
"assets/shaders/ink_sparkle.frag": "4096b5150bac93c41cbc9b45276bd90f",
"assets/AssetManifest.bin": "5c02df79279853073d9ca10af605b915",
"assets/fonts/MaterialIcons-Regular.otf": "ff266a15bda9a73f9326d6a31a1b39f1",
"privacy_policy.txt": "13c2188bc77b62131aa915093bd9a0d7",
"canvaskit/skwasm.js": "5b13215adfc99b441723b8d1c9987b43",
"canvaskit/skwasm.wasm": "3bd792dec9554ff490d6e4e36b2953ae",
"canvaskit/chromium/canvaskit.js": "9c4f8f68506cf4d2dc9b05219cd69920",
"canvaskit/chromium/canvaskit.wasm": "b471dbeb4fc3fd37df195aac61950378",
"canvaskit/canvaskit.js": "42cca10620a5e19f50b4d5cb990b74bf",
"canvaskit/canvaskit.wasm": "356afba65821bf4fd800e3079562e6eb",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
