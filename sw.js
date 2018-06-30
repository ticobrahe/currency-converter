// // Set a name for the current cache
// let staticCacheName = 'v2'; 

// // Default files to always cache
// let cacheFiles = [
// 	'./',
//     './index.html',
//     './js/idb.js',
//     './js/ui.js',
// 	'./js/app.js',
// 	'./image/loader.gif',
// 	'./css/styles.css',
//     'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700,400italic,700italic',
//     'https://bootswatch.com/4/litera/bootstrap.min.css'
// ]
self.addEventListener('install', e => {
    console.log('[ServiceWorker] Installed');
    // e.waitUntil(
    // 	// Open the cache
	//     caches.open(staticCacheName).then(cache => {
	//     	// Add all the default files to the cache
	// 		console.log('[ServiceWorker] Caching cacheFiles');
	// 		return cache.addAll(cacheFiles);
	//     })
	// ); 
});

self.addEventListener('activate', e => {
    console.log('[ServiceWorker] Activated');
    
    // e.waitUntil(

    // 	// Get all the cache keys (cacheName)
	// 	caches.keys().then(function(cacheNames) {
	// 		return Promise.all(cacheNames.map(cacheName => {

	// 			// If a cached item is saved under a previous cacheName
	// 			if (cacheName !== staticCacheName) {

	// 				// Delete that cached file
	// 				console.log('[ServiceWorker] Removing Cached Files from Cache - ', cacheName);
	// 				return caches.delete(cacheName);
	// 			}
	// 		}));
	// 	})
	//); // end e.waitUntil

});

self.addEventListener('fetch', e => {
    console.log('[ServiceWorker] Fetching', e.request.url);
    // event.respondWith(
    //     caches.match(event.request).then(response => {
    //       return response || fetch(event.request);
    //     })
    //   );
});