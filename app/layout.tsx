import type { Metadata, Viewport } from "next";
import { Anuphan } from "next/font/google";
import "./globals.css";

const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Life Manager - บริหารชีวิตด้วย Eisenhower Matrix",
  description: "แอพบริหารชีวิตให้มีประสิทธิภาพด้วยหลัก Eisenhower Matrix จัดลำดับความสำคัญของงานอย่างเป็นระบบ เพิ่มประสิทธิภาพการทำงานของคุณ",
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
  applicationName: "Life Manager",
  keywords: ["Eisenhower Matrix", "การบริหารเวลา", "จัดการงาน", "ประสิทธิภาพ", "โปรดักทิวิตี้"],
  authors: [{ name: "Life Manager Team" }],
  creator: "Life Manager Team",
  publisher: "Life Manager",
  category: "Productivity"
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6366f1'
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
        <meta name="theme-color" content="#6366f1" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <style>
          {`
            :root {
              /* สีหลักใหม่ */
              --primary-color: #6366f1;
              --primary-hover: #818cf8;
              --primary-light: rgba(99, 102, 241, 0.1);
              
              /* สีพื้นหลังและองค์ประกอบ */
              --background-dark: #07071f;
              --card-bg: #0d0d2b;
              --card-bg-hover: #1d1d42;
              --card-bg-secondary: #1d1d42;
              --border-color: #2d2b69;
              --border-color-light: #3d3d8d;
              
              /* สีข้อความ */
              --text-primary: #fff;
              --text-secondary: #ccc;
              --text-tertiary: #999;
              
              /* สีความสำคัญ */
              --priority-1: #ef4444; /* ทำทันที */
              --priority-2: #8b5cf6; /* วางแผนทำ */
              --priority-3: #f59e0b; /* มอบหมาย */
              --priority-4: #10b981; /* ตัดทิ้ง */
              
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
              background: linear-gradient(145deg, rgba(13, 13, 43, 0.7), rgba(29, 29, 66, 0.7));
              border-radius: var(--border-radius-md);
              box-shadow: var(--shadow-md);
              transition: all var(--transition-normal);
              border: 1px solid var(--border-color);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              overflow: hidden;
            }
            
            .app-card:hover {
              box-shadow: var(--shadow-lg);
              border-color: rgba(99, 102, 241, 0.2);
              transform: translateY(-2px);
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
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
              transform: rotate(30deg);
              transition: all 0.5s ease;
              opacity: 0;
            }
            
            .app-button:hover::after {
              opacity: 1;
              left: 100%;
            }

            .app-button-primary {
              background: linear-gradient(to right, var(--primary-color), var(--primary-hover));
              color: white;
              box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
            }

            .app-button-primary:hover {
              box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
              transform: translateY(-2px);
            }

            .app-button-secondary {
              background: rgba(29, 29, 66, 0.6);
              color: rgba(255, 255, 255, 0.8);
              border: 1px solid rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(4px);
              -webkit-backdrop-filter: blur(4px);
            }

            .app-button-secondary:hover {
              background: rgba(45, 43, 105, 0.6);
              color: white;
              transform: translateY(-2px);
            }

            /* Navigation links */
            .nav-link {
              display: flex;
              align-items: center;
              padding: 0.5rem 1rem;
              border-radius: 0.75rem;
              font-weight: 500;
              font-size: 0.875rem;
              transition: all 0.3s ease;
              color: rgba(255, 255, 255, 0.7);
              position: relative;
              overflow: hidden;
            }
            
            .nav-link::before {
              content: '';
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 2px;
              background: linear-gradient(to right, var(--primary-color), var(--primary-hover));
              transition: all 0.3s ease;
              opacity: 0;
            }
            
            .nav-link:hover {
              color: rgba(255, 255, 255, 0.95);
              background: rgba(255, 255, 255, 0.05);
            }
            
            .nav-link:hover::before {
              width: 70%;
              opacity: 1;
            }
            
            .nav-link-active {
              color: white;
              background: rgba(99, 102, 241, 0.1);
              position: relative;
            }
            
            .nav-link-active::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 70%;
              height: 2px;
              background: linear-gradient(to right, var(--primary-color), var(--primary-hover));
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
              background-color: rgba(29, 29, 66, 0.6);
              color: rgba(255, 255, 255, 0.8);
              border: 1px solid rgba(255, 255, 255, 0.08);
              transition: all 0.2s ease;
              backdrop-filter: blur(4px);
              -webkit-backdrop-filter: blur(4px);
            }
            
            .category-chip:hover {
              background-color: rgba(45, 43, 105, 0.6);
              transform: translateY(-1px);
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
              color: white;
              position: relative;
              padding-left: 1rem;
            }
            
            .section-title::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              height: 100%;
              width: 4px;
              background: linear-gradient(to bottom, var(--primary-color), var(--primary-hover));
              border-radius: 2px;
            }

            /* Animations */
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            .animate-fadeIn {
              animation: fadeIn 0.4s ease-out forwards;
            }
            
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
              100% { transform: translateY(0px); }
            }
            
            .floating-animation {
              animation: float 6s ease-in-out infinite;
            }
            
            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
              70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
              100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
            }
            
            .pulse-animation {
              animation: pulse 2s infinite;
            }

            /* Text gradients */
            .text-gradient-purple {
              background: linear-gradient(to right, #6366f1, #a78bfa);
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
              display: inline-block;
            }
            
            .text-gradient-green {
              background: linear-gradient(to right, #10b981, #34d399);
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
              display: inline-block;
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