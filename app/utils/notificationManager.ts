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

// ฟังก์ชันสำหรับทดสอบการแจ้งเตือน
export const testNotification = async (): Promise<{success: boolean, message: string}> => {
  // 1. ตรวจสอบการรองรับการแจ้งเตือน
  if (!isNotificationSupported()) {
    return {
      success: false,
      message: 'เบราว์เซอร์ของคุณไม่รองรับการแจ้งเตือน'
    };
  }

  // 2. ตรวจสอบสิทธิ์การแจ้งเตือน
  if (Notification.permission !== 'granted') {
    // ทำการขอสิทธิ์
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        message: 'ไม่ได้รับสิทธิ์ในการแจ้งเตือน โปรดอนุญาตในการตั้งค่าเบราว์เซอร์'
      };
    }
  }

  // 3. ตรวจสอบว่า Service Worker ลงทะเบียนแล้วหรือไม่
  try {
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await registerServiceWorker();
      if (!registration) {
        return {
          success: false,
          message: 'ไม่สามารถลงทะเบียน Service Worker ได้'
        };
      }
    }

    // 4. ทดสอบส่งการแจ้งเตือนทันที
    const result = await showNotification(
      'ทดสอบการแจ้งเตือน',
      'หากคุณเห็นข้อความนี้ แสดงว่าการแจ้งเตือนทำงานได้อย่างถูกต้อง',
      {
        vibrate: [200, 100, 200],
        tag: 'test-notification',
        renotify: true,
        requireInteraction: true,
        actions: [
          {
            action: 'test',
            title: 'ทดสอบสำเร็จ'
          }
        ]
      }
    );

    if (result) {
      return {
        success: true,
        message: 'ส่งการแจ้งเตือนทดสอบสำเร็จ โปรดตรวจสอบการแจ้งเตือนในอุปกรณ์ของคุณ'
      };
    } else {
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการส่งการแจ้งเตือน'
      };
    }
  } catch (error) {
    console.error('Error during notification test:', error);
    return {
      success: false,
      message: `เกิดข้อผิดพลาด: ${error.message || 'ไม่ทราบสาเหตุ'}`
    };
  }
}; 