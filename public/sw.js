// เวอร์ชันของแคชเพื่อให้สามารถอัพเดทได้ง่าย
const CACHE_VERSION = 'v1';
const CACHE_NAME = `life-manager-cache-${CACHE_VERSION}`;

// ไฟล์ที่ต้องการให้ Service Worker แคช
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// ติดตั้ง Service Worker และแคชไฟล์
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// เมื่อมีการเปิดใช้งาน Service Worker ใหม่ให้ลบแคชเก่า
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('life-manager-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

// ดักจับคำขอเครือข่ายและตอบสนองด้วยทรัพยากรจากแคชหากมี
self.addEventListener('fetch', event => {
  // ไม่แคชคำขอ API หรือที่มี query parameters
  if (event.request.url.includes('/api/') || event.request.url.includes('?')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // ตอบกลับจากแคชหากพบ
        if (response) {
          return response;
        }
        
        // ถ้าไม่พบในแคชให้ดึงจากเน็ตเวิร์ค
        return fetch(event.request).then(
          response => {
            // ตรวจสอบว่าการตอบกลับถูกต้องหรือไม่
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // โคลนการตอบกลับเพื่อบันทึกลงแคช
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        );
      })
  );
});

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
    console.error('Error showing notification:', error);
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
    const { title, options, delay } = event.data;
    
    setTimeout(() => {
      self.registration.showNotification(title, options);
    }, delay);
    
    // ส่งการยืนยันกลับ
    if (event.source) {
      event.source.postMessage({
        type: 'NOTIFICATION_SCHEDULED',
        id: event.data.id
      });
    }
  }
}); 