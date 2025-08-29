'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { User, localStorageUtils } from '@/lib/mockData';
import toast, { Toaster } from 'react-hot-toast';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLoginRecords, setShowLoginRecords] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentUser = localStorageUtils.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const { oldPassword, newPassword, confirmPassword } = passwordForm;
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('请填写所有字段');
      return;
    }
    
    if (oldPassword !== user.password) {
      toast.error('原密码错误');
      return;
    }
    
    if (newPassword.length < 6 || newPassword.length > 20) {
      toast.error('新密码长度必须在6-20个字符之间');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const users = localStorageUtils.getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorageUtils.saveUsers(users);
        localStorageUtils.saveCurrentUser(users[userIndex]);
        setUser(users[userIndex]);
      }
      
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      toast.success('密码修改成功');
      
    } catch (error) {
      toast.error('密码修改失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorageUtils.logout();
      toast.success('已退出登录');
      router.push('/');
    }
  };

  // 模拟登录记录数据
  const getLoginRecords = () => {
    if (!user) return [];
    
    return [
      { time: '2024-01-20 15:30:00', ip: '192.168.1.100' },
      { time: '2024-01-19 09:15:00', ip: '192.168.1.101' },
      { time: '2024-01-18 14:20:00', ip: '192.168.1.102' },
      { time: '2024-01-17 16:45:00', ip: '192.168.1.103' },
      { time: '2024-01-16 11:30:00', ip: '192.168.1.104' }
    ];
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">加载中...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <Toaster position="top-center" />
      
      <div className="h-full overflow-y-auto">
        <div className="p-4">
          {/* 个人信息区 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-4">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <i className="ri-user-line text-2xl text-blue-600"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
                <p className="text-sm text-gray-500">注册时间：{user.registerTime}</p>
                <p className="text-sm text-gray-500">最后登录：{user.lastLoginTime}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">当前积分</p>
                  <p className="text-2xl font-bold text-red-600">{user.points}</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <i className="ri-coin-line text-xl text-blue-600"></i>
                </div>
              </div>
            </div>
          </div>

          {/* 功能菜单 */}
          <div className="space-y-2">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <i className="ri-lock-line text-green-600"></i>
                </div>
                <span className="font-medium text-gray-900">修改密码</span>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
            </button>

            <button
              onClick={() => setShowLoginRecords(!showLoginRecords)}
              className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <i className="ri-history-line text-purple-600"></i>
                </div>
                <span className="font-medium text-gray-900">登录记录</span>
              </div>
              <i className={`ri-arrow-${showLoginRecords ? 'down' : 'right'}-s-line text-gray-400`}></i>
            </button>

            {/* 登录记录展开区域 */}
            {showLoginRecords && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <h3 className="font-medium text-gray-900 mb-3">最近5次登录记录</h3>
                <div className="space-y-3">
                  {getLoginRecords().map((record, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{record.time}</p>
                        <p className="text-xs text-gray-500">IP: {record.ip}</p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 管理员入口 */}
            {user.isAdmin && (
              <button
                onClick={() => router.push('/admin')}
                className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <i className="ri-settings-line text-orange-600"></i>
                  </div>
                  <span className="font-medium text-gray-900">会员管理</span>
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">管理员</span>
                </div>
                <i className="ri-arrow-right-s-line text-gray-400"></i>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:bg-red-50"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <i className="ri-logout-box-line text-red-600"></i>
                </div>
                <span className="font-medium text-red-600">退出登录</span>
              </div>
              <i className="ri-arrow-right-s-line text-red-400"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 修改密码弹窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">修改密码</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    原密码
                  </label>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    新密码
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    minLength={6}
                    maxLength={20}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">密码长度6-20个字符</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    确认新密码
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg whitespace-nowrap"
                  >
                    {submitting ? '修改中...' : '确认修改'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}