'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { localStorageUtils } from '@/lib/mockData';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const users = localStorageUtils.getUsers();
      const user = users.find(u => u.username === formData.username && u.password === formData.password);

      if (!user) {
        toast.error('用户名或密码错误');
        setLoading(false);
        return;
      }

      if (!user.isActive) {
        toast.error('账号已被禁用，请联系管理员');
        setLoading(false);
        return;
      }

      // 更新最后登录时间和IP
      user.lastLoginTime = new Date().toLocaleString();
      user.loginIP = '127.0.0.1'; // 模拟IP
      
      // 保存用户信息
      const updatedUsers = users.map(u => u.id === user.id ? user : u);
      localStorageUtils.saveUsers(updatedUsers);
      localStorageUtils.saveCurrentUser(user);

      toast.success('登录成功！');
      setTimeout(() => {
        router.push('/');
      }, 1000);

    } catch (error) {
      toast.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">交易论坛</h2>
          <p className="text-gray-600">登录您的账户</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                用户名
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="请输入用户名"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="请输入密码"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center text-sm">
              <span className="text-gray-600">还没有账户？</span>
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 ml-1">
                立即注册
              </Link>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600 mb-2">测试账号：</p>
            <div className="space-y-1 text-xs text-gray-500">
              <div>管理员：admin / admin123</div>
              <div>普通用户：张三 / 123456</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}