import type { Metadata, Viewport } from "next";
import { Anuphan } from "next/font/google";
import "./globals.css";

const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Life Manager - แอพบริหารชีวิตด้วย Eisenhower Matrix",
  description: "แอพบริหารชีวิตให้มีประสิทธิภาพด้วยหลัก Eisenhower Matrix จัดลำดับความสำคัญของงานอย่างเป็นระบบ",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-192x192.png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Life Manager"
  },
  applicationName: "Life Manager"
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ff6100'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ff6100" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <style>
          {`
            :root {
              /* สีหลัก */
              --primary-color: #ff6100;
              --primary-hover: #ff7d33;
              --primary-light: rgba(255, 97, 0, 0.1);
              
              /* สีพื้นหลังและองค์ประกอบ */
              --background-dark: #111;
              --card-bg: #1a1a1a;
              --card-bg-hover: #222;
              --card-bg-secondary: #1e1e1e;
              --border-color: #2d2d2d;
              --border-color-light: #3d3d3d;
              
              /* สีข้อความ */
              --text-primary: #fff;
              --text-secondary: #ccc;
              --text-tertiary: #999;
              
              /* สีความสำคัญ */
              --priority-1: #ef4444; /* ทำทันที */
              --priority-2: #ff6100; /* วางแผนทำ */
              --priority-3: #eab308; /* มอบหมาย */
              --priority-4: #22c55e; /* ตัดทิ้ง */
              
              /* ขนาดและระยะห่าง */
              --header-height: 64px;
              --gutter: 16px;
              --border-radius-sm: 8px;
              --border-radius-md: 12px;
              --border-radius-lg: 16px;
              --border-radius-pill: 9999px;
              
              /* ขนาดตัวอักษร */
              --font-size-xs: 12px;
              --font-size-sm: 14px;
              --font-size-md: 16px;
              --font-size-lg: 18px;
              --font-size-xl: 20px;
              
              /* เงา */
              --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
              --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
              --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
              
              /* อื่นๆ */
              --max-content-width: 1200px;
              --transition-fast: 0.2s ease;
              --transition-normal: 0.3s ease;
            }

            html, body {
              overflow-x: hidden;
              background-color: var(--background-dark);
              color: var(--text-primary);
              line-height: 1.5;
            }

            main {
              max-width: var(--max-content-width);
              margin: 0 auto;
              padding: 0 var(--gutter);
            }

            /* เลย์เอาท์การ์ด */
            .app-card {
              background-color: var(--card-bg);
              border-radius: var(--border-radius-md);
              box-shadow: var(--shadow-md);
              transition: all var(--transition-normal);
              border: 1px solid var(--border-color);
            }
            
            .app-card:hover {
              box-shadow: var(--shadow-lg);
            }
            
            /* พื้นที่ส่วนหัวการ์ด */
            .app-card-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 16px;
              padding-bottom: 12px;
              border-bottom: 1px solid var(--border-color);
            }

            /* ปุ่มต่างๆ */
            .app-button {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 8px 16px;
              border-radius: var(--border-radius-sm);
              font-weight: 500;
              transition: all var(--transition-fast);
              cursor: pointer;
            }

            .app-button-primary {
              background-color: var(--primary-color);
              color: white;
            }

            .app-button-primary:hover {
              background-color: var(--primary-hover);
              transform: translateY(-2px);
            }

            .app-button-secondary {
              background-color: var(--border-color);
              color: var(--text-secondary);
            }

            .app-button-secondary:hover {
              background-color: var(--border-color-light);
              color: var(--text-primary);
              transform: translateY(-2px);
            }
            
            /* แท็กและรายการ */
            .app-chip {
              display: inline-flex;
              align-items: center;
              padding: 6px 12px;
              border-radius: var(--border-radius-pill);
              font-size: var(--font-size-xs);
              background-color: var(--border-color);
              color: var(--text-secondary);
              transition: all var(--transition-fast);
            }
            
            .app-chip:hover {
              background-color: var(--border-color-light);
              transform: translateY(-1px);
            }
            
            /* แท็กหมวดหมู่ */
            .category-chip {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 6px 12px;
              border-radius: var(--border-radius-pill);
              font-size: var(--font-size-xs);
              font-weight: 500;
              background-color: var(--card-bg-secondary);
              color: var(--text-secondary);
            }
            
            /* เอฟเฟ็กต์เมื่อมีปฏิสัมพันธ์ */
            .hover-scale {
              transition: transform var(--transition-fast);
            }
            
            .hover-scale:hover {
              transform: scale(1.05);
            }
            
            .hover-lift {
              transition: transform var(--transition-normal), box-shadow var(--transition-normal);
            }
            
            .hover-lift:hover {
              transform: translateY(-4px);
              box-shadow: var(--shadow-lg);
            }
            
            /* ระดับความสำคัญ */
            .priority-1 { background-color: var(--priority-1); color: white; }
            .priority-2 { background-color: var(--priority-2); color: white; }
            .priority-3 { background-color: var(--priority-3); color: white; }
            .priority-4 { background-color: var(--priority-4); color: white; }
            
            .priority-badge {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              font-size: 12px;
              font-weight: bold;
              color: white;
            }
            
            /* วางแนวเนื้อหา */
            .content-section {
              margin-bottom: 24px;
            }
            
            .section-title {
              margin-bottom: 16px;
              font-size: var(--font-size-lg);
              font-weight: 600;
              border-left: 4px solid var(--primary-color);
              padding-left: 12px;
            }
          `}
        </style>
      </head>
      <body className={`${anuphan.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
