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
        {/* Google Font Icons */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0..200&display=swap" rel="stylesheet" />
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
            
            /* Material Icons */
            .material-symbols-rounded {
              font-variation-settings:
              'FILL' 1,
              'wght' 400,
              'GRAD' 0,
              'opsz' 24;
              vertical-align: middle;
            }

            /* อนิเมชั่น */
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            
            @keyframes floating {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-15px); }
              100% { transform: translateY(0px); }
            }
            
            @keyframes floating-reverse {
              0% { transform: translateY(0px); }
              50% { transform: translateY(15px); }
              100% { transform: translateY(0px); }
            }
            
            @keyframes scale-up {
              0% { transform: scale(0.95); opacity: 0.5; }
              100% { transform: scale(1); opacity: 1; }
            }
            
            @keyframes slide-up {
              0% { transform: translateY(10px); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes slide-down {
              0% { transform: translateY(-10px); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }

            /* คลาสอนิเมชั่น */
            .animate-shimmer {
              background: linear-gradient(90deg, 
                rgba(255,97,0,0.1), 
                rgba(255,97,0,0.3), 
                rgba(255,97,0,0.1)
              );
              background-size: 200% 100%;
              animation: shimmer 2s infinite;
            }
            
            .animate-floating {
              animation: floating 6s ease-in-out infinite;
            }
            
            .animate-floating-reverse {
              animation: floating-reverse 7s ease-in-out infinite;
            }
            
            .animate-scale-up {
              animation: scale-up 0.3s ease forwards;
            }
            
            .animate-slide-up {
              animation: slide-up 0.4s ease forwards;
            }
            
            .animate-slide-down {
              animation: slide-down 0.4s ease forwards;
            }

            /* เลย์เอาท์การ์ด */
            .app-card {
              background-color: var(--card-bg);
              border-radius: var(--border-radius-md);
              box-shadow: var(--shadow-md);
              transition: all var(--transition-normal);
              border: 1px solid var(--border-color);
              backdrop-filter: blur(10px);
              position: relative;
              overflow: hidden;
            }
            
            .app-card:hover {
              box-shadow: var(--shadow-lg);
            }
            
            .app-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: -150%;
              width: 40%;
              height: 100%;
              background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.05),
                transparent
              );
              transform: skewX(-25deg);
              transition: 0.75s;
            }
            
            .app-card:hover::before {
              left: 150%;
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
              position: relative;
              overflow: hidden;
            }
            
            .app-button::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              width: 5px;
              height: 5px;
              background: rgba(255, 255, 255, 0.4);
              opacity: 0;
              border-radius: 100%;
              transform: scale(1, 1) translate(-50%);
              transform-origin: 50% 50%;
            }
            
            .app-button:active::after {
              animation: ripple 0.6s ease-out;
            }
            
            @keyframes ripple {
              0% {
                transform: scale(0, 0);
                opacity: 0.5;
              }
              100% {
                transform: scale(20, 20);
                opacity: 0;
              }
            }

            .app-button-primary {
              background-color: var(--primary-color);
              color: white;
            }

            .app-button-primary:hover {
              background-color: var(--primary-hover);
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(255, 97, 0, 0.2);
            }
            
            .app-button-primary:active {
              transform: translateY(0);
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
            
            /* Add Button Animation */
            .add-button {
              width: 56px;
              height: 56px;
              border-radius: 50%;
              background-color: var(--primary-color);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              position: fixed;
              bottom: 24px;
              right: 24px;
              box-shadow: 0 4px 10px rgba(255, 97, 0, 0.3);
              transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              z-index: 100;
            }
            
            .add-button:hover {
              transform: scale(1.1);
              box-shadow: 0 6px 15px rgba(255, 97, 0, 0.4);
            }
            
            .add-button:active {
              transform: scale(0.95);
            }
            
            .add-button-pulse {
              animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
              0% {
                box-shadow: 0 0 0 0 rgba(255, 97, 0, 0.7);
              }
              70% {
                box-shadow: 0 0 0 15px rgba(255, 97, 0, 0);
              }
              100% {
                box-shadow: 0 0 0 0 rgba(255, 97, 0, 0);
              }
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
            
            /* Glass Effect */
            .glass-effect {
              background: rgba(26, 26, 26, 0.7);
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.05);
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
            
            /* Modal Animation */
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              backdrop-filter: blur(5px);
              animation: fadeIn 0.3s ease;
            }
            
            .modal-content {
              width: 90%;
              max-width: 500px;
              background-color: var(--card-bg);
              border-radius: var(--border-radius-md);
              padding: 20px;
              position: relative;
              animation: scaleIn 0.3s ease;
              border: 1px solid var(--border-color);
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            }
            
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes scaleIn {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            
            /* Todo Item Effects */
            .todo-item {
              position: relative;
              transition: all 0.3s ease;
              overflow: hidden;
            }
            
            .todo-item::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 2px;
              background: linear-gradient(90deg, 
                transparent, 
                rgba(255, 97, 0, 0.2), 
                transparent
              );
              transform: translateX(-100%);
              transition: transform 0.6s ease;
            }
            
            .todo-item:hover::after {
              transform: translateX(100%);
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
