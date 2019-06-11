let cacheFiles = [
	'./',
    './index.html',
	'./js/idb.js',
	'./js/app.js',
	'./manifest.json',
	'./image/loader.gif',
	'./image/icons/icon48.png',
	'./image/icons/icon96.png',
	'./image/icons/icon128.png',
	'./image/icons/icon144.png',
	'./image/icons/icon192.png',
	'./image/icons/icon256.png',
	'./image/icons/icon384.png',
	'./image/icons/icon512.png',
	'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700,400italic,700italic',
	'./css/styles.css',
	'https://free.currconv.com/api/v7/countries?apiKey=1ff15bdb656f557d2a09'
]

// Set a name for the current cache
var cacheName = 'converter-v1'; 


self.addEventListener('install', e => {
    console.log('[ServiceWorker] Installed');
    e.waitUntil(
	    caches.open(cacheName).then(cache => {
	    	// Add all files to the cache
			console.log('[ServiceWorker] Caching cacheFiles');
			return cache.addAll(cacheFiles);
	    })
	); 
});

self.addEventListener('activate', e => {
    console.log('[ServiceWorker] Activated');
    e.waitUntil(
   	    // Get all the cache keys
		caches.keys().then( cacheNames => {
			return Promise.all(cacheNames.map(thisCacheName => {
				// If a cached item is saved under a previous cacheName
				if (thisCacheName !== cacheName) {
					// Delete that cached file
					console.log('[ServiceWorker] Removing Cached Files from Cache ', thisCacheName);
					return caches.delete(thisCacheName);
				}
			}));
		})
	);

});


self.addEventListener('fetch', e => {
	console.log('[ServiceWorker] Fetch', e.request.url);
    const requesterURL = new URL(e.request.url);
    if(requesterURL.origin === location.origin){
        e.respondWith(
            caches.match(e.request).then(response => {
                return response|| fetch(e.request);
            })
        );
    }
});
