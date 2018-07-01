// Set a name for the current cache
let staticCacheName = 'v1'; 

// Default files to always cache
let cacheFiles = [
	'./',
    './index.html',
	'./js/idb.js',
    './js/currency-rate.js',
	'./js/app.js',
	'./image/loader.gif',
	'./css/styles.css',
    'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700,400italic,700italic',
    'https://bootswatch.com/4/litera/bootstrap.min.css'
]
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Installed');
    event.waitUntil(
    	// Open the cache
	    caches.open(staticCacheName).then(cache => {
	    	// Add all the default files to the cache
			console.log('[ServiceWorker] Caching cacheFiles');
			return cache.addAll(cacheFiles);
	    })
	); 
});

self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activated');
    
    event.waitUntil(

    	// Get all the cache keys (cacheName)
		caches.keys().then(function(cacheNames) {
			return Promise.all(cacheNames.map(cacheName => {
				// If a cached item is saved under a previous cacheName
				if (cacheName !== staticCacheName) {
					// Delete that cached file
					console.log('[ServiceWorker] Removing Cached Files from Cache - ', cacheName);
					return caches.delete(cacheName);
				}
			}));
		})
	); 

});

self.addEventListener('fetch', event => {
    console.log('[ServiceWorker] Fetching', event.request.url);
	event.respondWith(
		caches.match(event.request).then(function(resp) {
		  return resp || fetch(event.request).then(function(response) {
			let responseClone = response.clone();
			caches.open('v1').then(function(cache) {
			  cache.put(event.request, responseClone);
			});
	
			return response;
		  });
		}).catch( () => {
		  return caches.match('/image/loader.gif');
		})
	  );
});