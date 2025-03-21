// เวอร์ชันของแคชเพื่อให้สามารถอัพเดทได้ง่าย
const CACHE_VERSION = 'v2';
const CACHE_NAME = `life-manager-cache-${CACHE_VERSION}`;
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-cache-${CACHE_VERSION}`;

// ไฟล์สำคัญที่ต้องแคชไว้เพื่อให้แอปทำงานได้แม้ไม่มีอินเทอร์เน็ต (App Shell)
const APP_SHELL_FILES = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline'
];

// รายการไฟล์ที่ต้องการแคชเพิ่มเติมเมื่อผู้ใช้เข้าถึง
const ADDITIONAL_CACHE_FILES = [
  '/calendar'
];

// ขนาดแคชสูงสุดสำหรับ dynamic cache
const MAX_DYNAMIC_CACHE_ITEMS = 50;

// ติดตั้ง Service Worker และแคชไฟล์ App Shell
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // แคชไฟล์ App Shell
      caches.open(APP_SHELL_CACHE)
        .then(cache => {
          console.log('[Service Worker] Caching App Shell');
          return cache.addAll(APP_SHELL_FILES);
        }),
      // แคชไฟล์เพิ่มเติม
      caches.open(DYNAMIC_CACHE)
        .then(cache => {
          console.log('[Service Worker] Setting up Dynamic Cache');
          return cache;
        })
    ])
  );
  self.skipWaiting();
});

// เมื่อมีการเปิดใช้งาน Service Worker ใหม่ให้ลบแคชเก่า
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // ลบแคชเก่า
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return (
              cacheName.startsWith('life-manager-cache-') && cacheName !== CACHE_NAME ||
              cacheName.startsWith('app-shell-') && cacheName !== APP_SHELL_CACHE ||
              cacheName.startsWith('dynamic-cache-') && cacheName !== DYNAMIC_CACHE
            );
          }).map(cacheName => {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // ขอสิทธิ์ควบคุม clients ทั้งหมดทันที
      self.clients.claim()
    ])
  );
});

// จัดการคำขอเครือข่าย
self.addEventListener('fetch', event => {
  // ไม่แคชคำขอ API หรือที่มี query parameters
  if (event.request.url.includes('/api/') ||
    event.request.url.includes('?') ||
    event.request.method !== 'GET') {
    return;
  }

  // ใช้กลยุทธ์ "Stale While Revalidate" สำหรับทรัพยากรทั่วไป
  // คือดึงจากแคชก่อน แล้วอัปเดตแคชในพื้นหลัง
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // คืนค่าจากแคชถ้ามี
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // ไม่แคชการตอบกลับที่ไม่สำเร็จ
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // แคชการตอบกลับใหม่
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
                // จำกัดขนาดแคช (ในเวอร์ชันขั้นสูงควรใช้ IndexedDB)
                trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ITEMS);
              });

            return networkResponse;
          })
          .catch(error => {
            // ถ้าอินเทอร์เน็ตไม่ได้เชื่อมต่อและเป็นการขอหน้าเว็บหลัก
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline');
            }
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });

        return cachedResponse || fetchPromise;
      })
  );
});

// จำกัดขนาดแคช
function trimCache(cacheName, maxItems) {
  caches.open(cacheName)
    .then(cache => {
      cache.keys()
        .then(keys => {
          if (keys.length > maxItems) {
            // ลบรายการเก่าที่สุด
            cache.delete(keys[0])
              .then(() => {
                trimCache(cacheName, maxItems);
              });
          }
        });
    });
}

// จัดการกับการแจ้งเตือน push
self.addEventListener('push', event => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'มีรายการที่ต้องดำเนินการ',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: {
        url: data.url || '/',
        todoId: data.todoId
      },
      actions: [
        {
          action: 'view',
          title: 'ดูรายการ'
        },
        {
          action: 'close',
          title: 'ปิด'
        }
      ],
      vibrate: [200, 100, 200]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'แจ้งเตือนจาก Life Manager', options)
    );
  } catch (error) {
    console.error('[Service Worker] Error showing notification:', error);
  }
});

// จัดการกับการคลิกที่การแจ้งเตือน
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // ถ้ามีแท็บเปิดอยู่แล้วให้โฟกัสที่แท็บนั้น
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // ถ้าไม่มีแท็บให้เปิดแท็บใหม่
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// การจัดการกับการแจ้งเตือนที่กำหนดเวลาไว้
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, options, delay, id } = event.data;

    setTimeout(() => {
      self.registration.showNotification(title, options)
        .then(() => {
          // ส่งผลลัพธ์กลับไปยังแอป (ถ้าสามารถส่งได้)
          if (event.source) {
            event.source.postMessage({
              type: 'NOTIFICATION_SHOWN',
              id: id
            });
          }
        })
        .catch(error => {
          console.error('[Service Worker] Error showing scheduled notification:', error);
        });
    }, delay);

    // ส่งการยืนยันกลับ
    if (event.source) {
      event.source.postMessage({
        type: 'NOTIFICATION_SCHEDULED',
        id: id
      });
    }
  }
});

// ฟังก์ชันสำหรับซิงค์ข้อมูล (สามารถพัฒนาต่อให้ซิงค์กับ server ในอนาคต)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-todos') {
    event.waitUntil(
      // ใช้ IndexedDB จัดเก็บงานที่ต้องซิงค์ (ในเวอร์ชันสมบูรณ์)
      console.log('[Service Worker] Syncing data')
    );
  }
});