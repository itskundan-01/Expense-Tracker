// Service Worker for PWA functionality
const CACHE_NAME = 'expense-tracker-v2'; // Updated version to clear old cache
const urlsToCache = [
  '/',
  '/manifest.json',
  '/vite.svg'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Sync pending transactions when online
  try {
    const pendingTransactions = await getPendingTransactions();
    for (const transaction of pendingTransactions) {
      await syncTransaction(transaction);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getPendingTransactions() {
  // Get transactions from IndexedDB that need to be synced
  return [];
}

async function syncTransaction(transaction) {
  // Sync individual transaction
  console.log('Syncing transaction:', transaction);
}