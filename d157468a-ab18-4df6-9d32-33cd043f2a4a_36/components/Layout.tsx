'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('forum_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm h-14">
        <div className="h-full flex items-center justify-center">
          <h1 className="text-lg font-bold text-gray-900">交易论坛</h1>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="flex-1 pt-14 pb-14 overflow-hidden">
        {children}
      </main>

      {/* 底部导航菜单 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 h-14">
        <div className="h-full flex items-center">
          <Link 
            href="/" 
            className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 ${
              pathname === '/' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-home-line text-lg"></i>
            </div>
            <span className="text-xs">首页</span>
          </Link>
          
          <Link 
            href="/chat" 
            className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 ${
              pathname === '/chat' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-chat-3-line text-lg"></i>
            </div>
            <span className="text-xs">聊天</span>
          </Link>
          
          <Link 
            href={user ? "/profile" : "/login"} 
            className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 ${
              pathname === '/profile' || pathname === '/login' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-user-line text-lg"></i>
            </div>
            <span className="text-xs">我的</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}