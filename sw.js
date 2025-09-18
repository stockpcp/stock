// Service Worker para Cache - Stock Management System
// Versão: 1.0

const CACHE_NAME = 'stock-system-v1';
const STATIC_CACHE_NAME = 'stock-static-v1';
const DYNAMIC_CACHE_NAME = 'stock-dynamic-v1';

// Arquivos para cache estático (recursos que não mudam frequentemente)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.min.css',
    '/styles_improved.min.css',
    '/inter-tight-font.css',
    '/script_optimized.min.js',
    '/lang_fixed.min.js',
    '/logistics.min.js',
    '/stock-date-addon.min.js',
    '/icon.png',
    '/logo.png'
];

// Arquivos dinâmicos (podem mudar com mais frequência)
const DYNAMIC_ASSETS = [
    '/stock_data.json',
    '/info_data.json',
    '/lang.json'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE_NAME).then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS.map(url => new Request(url, {
                    cache: 'reload'
                })));
            }),
            
            // Pre-cache dynamic assets
            caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                console.log('Service Worker: Pre-caching dynamic assets');
                return cache.addAll(DYNAMIC_ASSETS.map(url => new Request(url, {
                    cache: 'no-cache'
                })));
            })
        ]).then(() => {
            console.log('Service Worker: Installation complete');
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old caches
                    if (cacheName !== STATIC_CACHE_NAME && 
                        cacheName !== DYNAMIC_CACHE_NAME &&
                        cacheName.startsWith('stock-')) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (url.origin !== location.origin) {
        return;
    }
    
    event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    try {
        // Strategy 1: Static assets - Cache First
        if (isStaticAsset(pathname)) {
            return await cacheFirst(request, STATIC_CACHE_NAME);
        }
        
        // Strategy 2: Dynamic assets - Network First with cache fallback
        if (isDynamicAsset(pathname)) {
            return await networkFirst(request, DYNAMIC_CACHE_NAME);
        }
        
        // Strategy 3: HTML pages - Network First
        if (pathname === '/' || pathname.endsWith('.html')) {
            return await networkFirst(request, DYNAMIC_CACHE_NAME);
        }
        
        // Strategy 4: Other assets - Cache First with network fallback
        return await cacheFirst(request, DYNAMIC_CACHE_NAME);
        
    } catch (error) {
        console.error('Service Worker: Fetch error:', error);
        
        // Fallback for HTML requests
        if (pathname === '/' || pathname.endsWith('.html')) {
            const cachedResponse = await caches.match('/index.html');
            if (cachedResponse) {
                return cachedResponse;
            }
        }
        
        // Return network error
        throw error;
    }
}

// Cache First strategy
async function cacheFirst(request, cacheName) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Serve from cache
        console.log('Service Worker: Serving from cache:', request.url);
        
        // Update cache in background for next time
        updateCacheInBackground(request, cacheName);
        
        return cachedResponse;
    }
    
    // Fetch from network and cache
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
        console.log('Service Worker: Cached new resource:', request.url);
    }
    
    return networkResponse;
}

// Network First strategy
async function networkFirst(request, cacheName) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Update cache with fresh content
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
            console.log('Service Worker: Updated cache from network:', request.url);
        }
        
        return networkResponse;
        
    } catch (error) {
        // Network failed, try cache
        console.log('Service Worker: Network failed, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            console.log('Service Worker: Serving stale content from cache:', request.url);
            return cachedResponse;
        }
        
        throw error;
    }
}

// Update cache in background
async function updateCacheInBackground(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            await cache.put(request, networkResponse);
            console.log('Service Worker: Background cache update:', request.url);
        }
    } catch (error) {
        console.log('Service Worker: Background update failed:', request.url);
    }
}

// Helper functions
function isStaticAsset(pathname) {
    return pathname.endsWith('.css') ||
           pathname.endsWith('.js') ||
           pathname.endsWith('.png') ||
           pathname.endsWith('.jpg') ||
           pathname.endsWith('.jpeg') ||
           pathname.endsWith('.gif') ||
           pathname.endsWith('.svg') ||
           pathname.endsWith('.woff') ||
           pathname.endsWith('.woff2') ||
           pathname.endsWith('.ttf') ||
           pathname.endsWith('.eot');
}

function isDynamicAsset(pathname) {
    return pathname.endsWith('.json') ||
           pathname.includes('api/') ||
           pathname.includes('data/');
}

// Message handling for cache updates
self.addEventListener('message', event => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'UPDATE_CACHE':
            updateSpecificCache(payload.url, payload.cacheName);
            break;
            
        case 'CLEAR_CACHE':
            clearCache(payload.cacheName);
            break;
            
        default:
            console.log('Service Worker: Unknown message type:', type);
    }
});

async function updateSpecificCache(url, cacheName) {
    try {
        const cache = await caches.open(cacheName || DYNAMIC_CACHE_NAME);
        const response = await fetch(url, { cache: 'no-cache' });
        
        if (response.ok) {
            await cache.put(url, response);
            console.log('Service Worker: Manual cache update:', url);
        }
    } catch (error) {
        console.error('Service Worker: Manual cache update failed:', error);
    }
}

async function clearCache(cacheName) {
    try {
        if (cacheName) {
            await caches.delete(cacheName);
            console.log('Service Worker: Cache cleared:', cacheName);
        } else {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(name => caches.delete(name))
            );
            console.log('Service Worker: All caches cleared');
        }
    } catch (error) {
        console.error('Service Worker: Cache clear failed:', error);
    }
}

