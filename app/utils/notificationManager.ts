// ตรวจสอบว่าเบราว์เซอร์รองรับ Notification API หรือไม่
export const isNotificationSupported = () => {
  return typeof window !== 'undefined' &&
         'Notification' in window &&
         'serviceWorker' in navigator &&
         'PushManager' in window;
};

// ขอสิทธิ์ในการแสดงการแจ้งเตือน
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser');
    return 'denied';
  }

  // ตรวจสอบสิทธิ์ปัจจุบัน
  if (Notification.permission === 'granted') {
    return 'granted';
  }

  // ขอสิทธิ์ใหม่
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

// ลงทะเบียน Service Worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker is not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered successfully:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// สร้างการแจ้งเตือน
export const showNotification = async (
  title: string,
  body: string,
  options: { [key: string]: any } = {}
): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser');
    return false;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    } as NotificationOptions);
    
    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
};

// กำหนดเวลาการแจ้งเตือน
export const scheduleNotification = async (
  title: string,
  body: string,
  scheduledTime: Date,
  todoId?: number,
  options: { [key: string]: any } = {}
): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser');
    return false;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return false;
  }

  try {
    const now = new Date();
    const targetTime = new Date(scheduledTime);
    
    // ถ้าเวลาผ่านไปแล้ว ให้แจ้งเตือนทันที
    if (targetTime <= now) {
      return showNotification(title, body, { ...options, data: { todoId } });
    }
    
    // คำนวณเวลาที่ต้องรอ (milliseconds)
    const delay = targetTime.getTime() - now.getTime();
    
    // ตั้งเวลาการแจ้งเตือน (โดยใช้ setTimeout เมื่อหน้าเว็บเปิดอยู่)
    setTimeout(() => {
      showNotification(title, body, { ...options, data: { todoId } });
    }, delay);
    
    // ถ้ามี Service Worker ลงทะเบียนแล้ว ให้ส่งข้อมูลการแจ้งเตือนไปยัง Service Worker
    const registration = await navigator.serviceWorker.ready;
    
    if (registration && registration.active) {
      const messageId = Date.now().toString();
      registration.active.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        id: messageId,
        title,
        options: {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          data: { todoId },
          ...options
        },
        delay
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
};

// ยกเลิกการแจ้งเตือนทั้งหมด
export const cancelAllNotifications = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications();
    
    notifications.forEach(notification => notification.close());
    return true;
  } catch (error) {
    console.error('Error canceling notifications:', error);
    return false;
  }
}; 