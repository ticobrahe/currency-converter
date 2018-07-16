let cacheFiles = [
	'./',
    './index.html',
	'./js/idb.js',
    './js/currency-rate.js',
	'./js/app.js',
	'./image/loader.gif',
	'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700,400italic,700italic',
	'./css/styles.css' ,
	'https://free.currencyconverterapi.com/api/v5/countries'
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
    console.log(requesterURL.pathname);
    if(requesterURL.origin === location.origin){
        e.respondWith(
            caches.match(e.request).then(response => {
                return response|| fetch(e.request);
            })
        );
    }
});
