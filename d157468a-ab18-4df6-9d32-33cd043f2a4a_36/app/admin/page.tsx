
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { User, Post, localStorageUtils } from '@/lib/mockData';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    price: '',
    authorId: '',
    isForSale: false,
    soldContent: ''
  });
  const router = useRouter();

  useEffect(() => {
    const user = localStorageUtils.getCurrentUser();
    if (!user || !user.isAdmin) {
      toast.error('权限不足，请使用管理员账号登录');
      router.push('/');
      return;
    }
    
    setCurrentUser(user);
    loadData();
    setLoading(false);
  }, [router]);

  const loadData = () => {
    const allUsers = localStorageUtils.getUsers();
    const allPosts = localStorageUtils.getPosts();
    setUsers(allUsers);
    setPosts(allPosts);
  };

  const handleUserStatusToggle = (userId: string) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    );
    setUsers(updatedUsers);
    localStorageUtils.saveUsers(updatedUsers);
    toast.success('用户状态已更新');
  };

  const handleUserEdit = (user: User) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleUserUpdate = () => {
    if (!editingUser) return;
    
    if (editingUser.points < 0) {
      toast.error('积分不能小于0');
      return;
    }

    const updatedUsers = users.map(user => 
      user.id === editingUser.id ? editingUser : user
    );
    setUsers(updatedUsers);
    localStorageUtils.saveUsers(updatedUsers);
    setShowEditModal(false);
    setEditingUser(null);
    toast.success('用户信息已更新');
  };

  const handleDeletePost = (postId: string) => {
    if (!confirm('确定要删除这个帖子吗？')) return;
    
    const updatedPosts = posts.filter(post => post.id !== postId);
    setPosts(updatedPosts);
    localStorageUtils.savePosts(updatedPosts);
    toast.success('帖子已删除');
  };

  const handlePinPost = (postId: string, level: number) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isPinned: level > 0,
          pinnedLevel: level
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorageUtils.savePosts(updatedPosts);
    toast.success('帖子置顶状态已更新');
  };

  const handlePostColorTag = (postId: string, colorTag: string) => {
    const updatedPosts = posts.map(post => 
      post.id === postId ? { ...post, colorTag: colorTag || undefined } : post
    );
    setPosts(updatedPosts);
    localStorageUtils.savePosts(updatedPosts);
    toast.success('帖子标记已更新');
  };

  const handlePostSelection = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSelectAllPosts = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(post => post.id));
    }
  };

  const handleBatchSetFree = () => {
    if (selectedPosts.length === 0) {
      toast.error('请先选择要操作的帖子');
      return;
    }

    if (!confirm(`确定要将选中的 ${selectedPosts.length} 个帖子设置为免费吗？`)) return;

    const updatedPosts = posts.map(post => {
      if (selectedPosts.includes(post.id)) {
        return {
          ...post,
          isForSale: false,
          price: undefined,
          soldContent: undefined
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorageUtils.savePosts(updatedPosts);
    setSelectedPosts([]);
    toast.success(`已将 ${selectedPosts.length} 个帖子设置为免费`);
  };

  const handleBatchPin = (pinnedLevel: number) => {
    if (selectedPosts.length === 0) {
      toast.error('请先选择要操作的帖子');
      return;
    }

    const levelText = pinnedLevel === 0 ? '取消置顶' : `设置为${pinnedLevel}级置顶`;
    if (!confirm(`确定要将选中的 ${selectedPosts.length} 个帖子${levelText}吗？`)) return;

    const updatedPosts = posts.map(post => {
      if (selectedPosts.includes(post.id)) {
        return {
          ...post,
          isPinned: pinnedLevel > 0,
          pinnedLevel: pinnedLevel
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorageUtils.savePosts(updatedPosts);
    setSelectedPosts([]);
    toast.success(`已${levelText} ${selectedPosts.length} 个帖子`);
  };

  const handleBatchColorTag = (colorTag: string) => {
    if (selectedPosts.length === 0) {
      toast.error('请先选择要操作的帖子');
      return;
    }

    const colorText = colorTag === 'none' ? '清除标记' : `设置${colorTag}标记`;
    if (!confirm(`确定要将选中的 ${selectedPosts.length} 个帖子${colorText}吗？`)) return;

    const updatedPosts = posts.map(post => {
      if (selectedPosts.includes(post.id)) {
        return {
          ...post,
          colorTag: colorTag === 'none' ? undefined : colorTag
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorageUtils.savePosts(updatedPosts);
    setSelectedPosts([]);
    toast.success(`已为 ${selectedPosts.length} 个帖子${colorText}`);
  };

  const handleBatchDelete = () => {
    if (selectedPosts.length === 0) {
      toast.error('请先选择要操作的帖子');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedPosts.length} 个帖子吗？此操作不可恢复！`)) return;

    const updatedPosts = posts.filter(post => !selectedPosts.includes(post.id));
    setPosts(updatedPosts);
    localStorageUtils.savePosts(updatedPosts);
    setSelectedPosts([]);
    toast.success(`已删除 ${selectedPosts.length} 个帖子`);
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim()) {
      toast.error('请输入帖子标题');
      return;
    }
    
    if (!newPost.content.trim()) {
      toast.error('请输入帖子内容');
      return;
    }
    
    if (!newPost.authorId) {
      toast.error('请选择作者');
      return;
    }

    if (newPost.isForSale && parseFloat(newPost.price) <= 0) {
      toast.error('付费内容价格必须大于0');
      return;
    }

    if (newPost.isForSale && !newPost.soldContent.trim()) {
      toast.error('请输入付费内容详情');
      return;
    }

    const selectedAuthor = users.find(u => u.id === newPost.authorId);
    if (!selectedAuthor) {
      toast.error('选择的作者不存在');
      return;
    }

    const createdPost: Post = {
      id: Date.now().toString(),
      title: newPost.title.trim(),
      content: newPost.content.trim(),
      price: newPost.isForSale ? parseFloat(newPost.price) : undefined,
      authorId: newPost.authorId,
      authorName: selectedAuthor.username,
      createTime: new Date().toLocaleString(),
      isPinned: false,
      pinnedLevel: 0,
      isForSale: newPost.isForSale,
      soldContent: newPost.isForSale ? newPost.soldContent.trim() : undefined,
      replies: []
    };

    const updatedPosts = [createdPost, ...posts];
    setPosts(updatedPosts);
    localStorageUtils.savePosts(updatedPosts);
    
    setShowCreatePostModal(false);
    setNewPost({
      title: '',
      content: '',
      price: '',
      authorId: '',
      isForSale: false,
      soldContent: ''
    });
    
    toast.success('帖子发布成功');
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    const nonAdminUsers = users.filter(u => !u.isAdmin);
    if (selectedUsers.length === nonAdminUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(nonAdminUsers.map(user => user.id));
    }
  };

  const handleBatchDisableUsers = () => {
    if (selectedUsers.length === 0) {
      toast.error('请先选择要操作的用户');
      return;
    }

    if (!confirm(`确定要禁用选中的 ${selectedUsers.length} 个用户吗？`)) return;

    const updatedUsers = users.map(user => {
      if (selectedUsers.includes(user.id) && !user.isAdmin) {
        return { ...user, isActive: false };
      }
      return user;
    });

    setUsers(updatedUsers);
    localStorageUtils.saveUsers(updatedUsers);
    setSelectedUsers([]);
    toast.success(`已禁用 ${selectedUsers.length} 个用户`);
  };

  const handleBatchEnableUsers = () => {
    if (selectedUsers.length === 0) {
      toast.error('请先选择要操作的用户');
      return;
    }

    if (!confirm(`确定要启用选中的 ${selectedUsers.length} 个用户吗？`)) return;

    const updatedUsers = users.map(user => {
      if (selectedUsers.includes(user.id)) {
        return { ...user, isActive: true };
      }
      return user;
    });

    setUsers(updatedUsers);
    localStorageUtils.saveUsers(updatedUsers);
    setSelectedUsers([]);
    toast.success(`已启用 ${selectedUsers.length} 个用户`);
  };

  const handleBatchResetPassword = () => {
    if (selectedUsers.length === 0) {
      toast.error('请先选择要操作的用户');
      return;
    }

    if (!confirm(`确定要将选中的 ${selectedUsers.length} 个用户密码重置为 "123456" 吗？`)) return;

    const updatedUsers = users.map(user => {
      if (selectedUsers.includes(user.id) && !user.isAdmin) {
        return { ...user, password: '123456' };
      }
      return user;
    });

    setUsers(updatedUsers);
    localStorageUtils.saveUsers(updatedUsers);
    setSelectedUsers([]);
    toast.success(`已重置 ${selectedUsers.length} 个用户密码`);
  };

  const handleBatchAddPoints = () => {
    if (selectedUsers.length === 0) {
      toast.error('请先选择要操作的用户');
      return;
    }

    const pointsToAdd = prompt('请输入要增加的积分数量：');
    if (!pointsToAdd || isNaN(Number(pointsToAdd))) {
      toast.error('请输入有效的积分数量');
      return;
    }

    const points = parseInt(pointsToAdd);
    if (points <= 0) {
      toast.error('积分数量必须大于0');
      return;
    }

    if (!confirm(`确定要为选中的 ${selectedUsers.length} 个用户增加 ${points} 积分吗？`)) return;

    const updatedUsers = users.map(user => {
      if (selectedUsers.includes(user.id)) {
        return { ...user, points: user.points + points };
      }
      return user;
    });

    setUsers(updatedUsers);
    localStorageUtils.saveUsers(updatedUsers);
    setSelectedUsers([]);
    toast.success(`已为 ${selectedUsers.length} 个用户增加 ${points} 积分`);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost({ ...post });
    setShowEditPostModal(true);
  };

  const handleUpdatePost = () => {
    if (!editingPost) return;
    
    if (!editingPost.title.trim()) {
      toast.error('请输入帖子标题');
      return;
    }
    
    if (!editingPost.content.trim()) {
      toast.error('请输入帖子内容');
      return;
    }

    if (editingPost.isForSale && (!editingPost.price || editingPost.price <= 0)) {
      toast.error('付费内容价格必须大于0');
      return;
    }

    if (editingPost.isForSale && !editingPost.soldContent?.trim()) {
      toast.error('请输入付费内容详情');
      return;
    }

    const updatedPosts = posts.map(post => 
      post.id === editingPost.id ? {
        ...editingPost,
        title: editingPost.title.trim(),
        content: editingPost.content.trim(),
        soldContent: editingPost.isForSale ? editingPost.soldContent?.trim() : undefined
      } : post
    );
    
    setPosts(updatedPosts);
    localStorageUtils.savePosts(updatedPosts);
    setShowEditPostModal(false);
    setEditingPost(null);
    toast.success('帖子已更新');
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

  return (
    <Layout>
      <Toaster position="top-center" />
      
      <div className="h-full overflow-y-auto">
        <div className="p-4">
          {/* 页面标题 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
                <p className="text-gray-600 mt-1">欢迎，{currentUser?.username} 管理员</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-admin-line text-xl text-blue-600"></i>
              </div>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">用户总数</p>
                  <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-user-line text-blue-600"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">帖子总数</p>
                  <p className="text-2xl font-bold text-green-600">{posts.length}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="ri-article-line text-green-600"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">活跃用户</p>
                  <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.isActive).length}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="ri-user-star-line text-purple-600"></i>
                </div>
              </div>
            </div>
          </div>

          {/* 标签页切换 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className="ri-user-settings-line mr-2"></i>
                  用户管理
                </button>
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'posts'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className="ri-article-line mr-2"></i>
                  帖子管理
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'create'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className="ri-add-line mr-2"></i>
                  发布帖子
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* 用户管理 */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">用户列表</h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      {selectedUsers.length > 0 && (
                        <>
                          <button
                            onClick={handleBatchDisableUsers}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium whitespace-nowrap"
                          >
                            <i className="ri-user-forbid-line mr-1"></i>
                            批量禁用({selectedUsers.length})
                          </button>
                          <button
                            onClick={handleBatchEnableUsers}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium whitespace-nowrap"
                          >
                            <i className="ri-user-add-line mr-1"></i>
                            批量启用({selectedUsers.length})
                          </button>
                          <button
                            onClick={handleBatchResetPassword}
                            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium whitespace-nowrap"
                          >
                            <i className="ri-lock-password-line mr-1"></i>
                            重置密码({selectedUsers.length})
                          </button>
                          <button
                            onClick={handleBatchAddPoints}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium whitespace-nowrap"
                          >
                            <i className="ri-coin-line mr-1"></i>
                            增加积分({selectedUsers.length})
                          </button>
                        </>
                      )}
                      <button
                        onClick={handleSelectAllUsers}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm whitespace-nowrap"
                      >
                        {selectedUsers.length === users.filter(u => !u.isAdmin).length ? '取消全选' : '全选'}
                      </button>
                    </div>
                  </div>
                  
                  {users.map((user) => (
                    <div key={user.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {!user.isAdmin && (
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelection(user.id)}
                            className="w-4 h-4"
                          />
                        )}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.isActive ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <i className={`ri-user-line ${
                            user.isActive ? 'text-green-600' : 'text-red-600'
                          }`}></i>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{user.username}</h4>
                            <span className="font-bold text-red-600">{user.points}</span>
                            {user.isAdmin && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                                管理员
                              </span>
                            )}
                            {!user.isActive && (
                              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                                已禁用
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            密码: {user.password} | 注册: {user.registerTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUserEdit(user)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm whitespace-nowrap"
                        >
                          编辑
                        </button>
                        {!user.isAdmin && (
                          <button
                            onClick={() => handleUserStatusToggle(user.id)}
                            className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
                              user.isActive
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                          >
                            {user.isActive ? '禁用' : '启用'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 帖子管理 */}
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">帖子列表</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedPosts.length > 0 && (
                        <>
                          <button
                            onClick={handleBatchSetFree}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium whitespace-nowrap"
                          >
                            <i className="ri-money-dollar-circle-line mr-1"></i>
                            设为免费({selectedPosts.length})
                          </button>
                          
                          <div className="relative group">
                            <button className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium whitespace-nowrap">
                              <i className="ri-pushpin-line mr-1"></i>
                              批量置顶({selectedPosts.length})
                            </button>
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                              <button
                                onClick={() => handleBatchPin(0)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                              >
                                取消置顶
                              </button>
                              <button
                                onClick={() => handleBatchPin(1)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                              >
                                普通置顶
                              </button>
                              <button
                                onClick={() => handleBatchPin(2)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                              >
                                管理员置顶
                              </button>
                              <button
                                onClick={() => handleBatchPin(3)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                              >
                                永久置顶
                              </button>
                            </div>
                          </div>
                          
                          <div className="relative group">
                            <button className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium whitespace-nowrap">
                              <i className="ri-palette-line mr-1"></i>
                              批量标记({selectedPosts.length})
                            </button>
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                              <button
                                onClick={() => handleBatchColorTag('none')}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                              >
                                清除标记
                              </button>
                              <button
                                onClick={() => handleBatchColorTag('red')}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center"
                              >
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                红色标记
                              </button>
                              <button
                                onClick={() => handleBatchColorTag('blue')}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center"
                              >
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                蓝色标记
                              </button>
                              <button
                                onClick={() => handleBatchColorTag('green')}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center"
                              >
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                绿色标记
                              </button>
                              <button
                                onClick={() => handleBatchColorTag('yellow')}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center"
                              >
                                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                黄色标记
                              </button>
                            </div>
                          </div>
                          
                          <button
                            onClick={handleBatchDelete}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium whitespace-nowrap"
                          >
                            <i className="ri-delete-bin-line mr-1"></i>
                            批量删除({selectedPosts.length})
                          </button>
                        </>
                      )}
                      <button
                        onClick={handleSelectAllPosts}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm whitespace-nowrap"
                      >
                        {selectedPosts.length === posts.length ? '取消全选' : '全选'}
                      </button>
                    </div>
                  </div>
                  
                  {posts.map((post) => (
                    <div key={post.id} className={`bg-gray-50 rounded-lg p-4 ${
                      post.colorTag ? `border-l-4 border-${post.colorTag}-500` : ''
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedPosts.includes(post.id)}
                            onChange={() => handlePostSelection(post.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{post.title}</h4>
                              {post.isPinned && (
                                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                                  置顶{post.pinnedLevel}
                                </span>
                              )}
                              {post.isForSale && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                                  付费内容 ¥{post.price}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* 置顶操作 */}
                              <select
                                value={post.isPinned ? post.pinnedLevel : 0}
                                onChange={(e) => handlePinPost(post.id, parseInt(e.target.value))}
                                className="px-2 py-1 border border-gray-300 rounded text-sm pr-8"
                              >
                                <option value={0}>不置顶</option>
                                <option value={1}>普通置顶</option>
                                <option value={2}>管理员置顶</option>
                                <option value={3}>永久置顶</option>
                              </select>
                              
                              {/* 颜色标记 */}
                              <select
                                value={post.colorTag || ''}
                                onChange={(e) => handlePostColorTag(post.id, e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm pr-8"
                              >
                                <option value="">无标记</option>
                                <option value="red">红色标记</option>
                                <option value="blue">蓝色标记</option>
                                <option value="green">绿色标记</option>
                                <option value="yellow">黄色标记</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm whitespace-nowrap"
                          >
                            <i className="ri-edit-line mr-1"></i>
                            修改内容
                          </button>
                          
                          <button
                            onClick={() => {
                              if (post.isForSale) {
                                // 取消付费
                                if (confirm('确定要取消付费设置吗？')) {
                                  const updatedPosts = posts.map(p => 
                                    p.id === post.id ? { 
                                      ...p, 
                                      isForSale: false, 
                                      price: undefined, 
                                      soldContent: undefined 
                                    } : p
                                  );
                                  setPosts(updatedPosts);
                                  localStorageUtils.savePosts(updatedPosts);
                                  toast.success('已取消付费设置');
                                }
                              } else {
                                // 设置付费
                                const price = prompt('请设置价格（元）:');
                                if (price && !isNaN(parseFloat(price)) && parseFloat(price) > 0) {
                                  const soldContent = prompt('请输入付费内容详情:');
                                  if (soldContent && soldContent.trim()) {
                                    const updatedPosts = posts.map(p => 
                                      p.id === post.id ? { 
                                        ...p, 
                                        isForSale: true, 
                                        price: parseFloat(price), 
                                        soldContent: soldContent.trim() 
                                      } : p
                                    );
                                    setPosts(updatedPosts);
                                    localStorageUtils.savePosts(updatedPosts);
                                    toast.success('付费设置已保存');
                                  }
                                }
                              }
                            }}
                            className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
                              post.isForSale 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            }`}
                          >
                            <i className={`mr-1 ${post.isForSale ? 'ri-money-dollar-circle-line' : 'ri-price-tag-3-line'}`}></i>
                            {post.isForSale ? '取消付费' : '设置付费'}
                          </button>
                          
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm whitespace-nowrap"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 发布帖子 */}
              {activeTab === 'create' && (
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">发布新帖子</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        帖子标题
                      </label>
                      <input
                        type="text"
                        value={newPost.title}
                        onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                        placeholder="请输入帖子标题"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        选择作者
                      </label>
                      <select
                        value={newPost.authorId}
                        onChange={(e) => setNewPost({...newPost, authorId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                      >
                        <option value="">请选择作者</option>
                        {users.filter(u => u.isActive).map(user => (
                          <option key={user.id} value={user.id}>
                            {user.username} {user.isAdmin ? '(管理员)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        帖子内容
                      </label>
                      <textarea
                        value={newPost.content}
                        onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                        placeholder="请输入帖子内容"
                        rows={6}
                        maxLength={1000}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {newPost.content.length}/1000
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="isForSale"
                          checked={newPost.isForSale}
                          onChange={(e) => setNewPost({...newPost, isForSale: e.target.checked})}
                          className="mr-2"
                        />
                        <label htmlFor="isForSale" className="text-sm font-medium text-gray-700">
                          这是付费内容
                        </label>
                      </div>

                      {newPost.isForSale && (
                        <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              商品价格 (元)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={newPost.price}
                              onChange={(e) => setNewPost({...newPost, price: e.target.value})}
                              placeholder="0.00"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              付费内容详情
                            </label>
                            <textarea
                              value={newPost.soldContent}
                              onChange={(e) => setNewPost({...newPost, soldContent: e.target.value})}
                              placeholder="购买后用户可看到的详细内容，如联系方式、具体配置等"
                              rows={4}
                              maxLength={500}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {newPost.soldContent.length}/500
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button
                        onClick={() => {
                          setNewPost({
                            title: '',
                            content: '',
                            price: '',
                            authorId: '',
                            isForSale: false,
                            soldContent: ''
                          });
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                      >
                        重置
                      </button>
                      <button
                        onClick={handleCreatePost}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg whitespace-nowrap"
                      >
                        发布帖子
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 编辑用户弹窗 */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">编辑用户信息</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    用户名
                  </label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    积分余额
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingUser.points}
                    onChange={(e) => setEditingUser({...editingUser, points: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="adminStatus"
                    checked={editingUser.isAdmin}
                    onChange={(e) => setEditingUser({...editingUser, isAdmin: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="adminStatus" className="text-sm text-gray-700">
                    管理员权限
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleUserUpdate}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg whitespace-nowrap"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑帖子弹窗 */}
      {showEditPostModal && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">编辑帖子</h3>
                <button
                  onClick={() => setShowEditPostModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    帖子标题
                  </label>
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                    placeholder="请输入帖子标题"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    帖子内容
                  </label>
                  
                  {/* 格式化工具栏 */}
                  <div className="border border-gray-300 rounded-t-lg p-3 bg-gray-50 flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">字体大小:</label>
                      <select
                        value="14"
                        onChange={(e) => {
                          const textarea = document.getElementById('editContent') as HTMLTextAreaElement;
                          if (textarea) {
                            textarea.style.fontSize = e.target.value + 'px';
                          }
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-xs pr-6"
                      >
                        <option value="12">12px</option>
                        <option value="14">14px</option>
                        <option value="16">16px</option>
                        <option value="18">18px</option>
                        <option value="20">20px</option>
                        <option value="24">24px</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">字体颜色:</label>
                      <input
                        type="color"
                        defaultValue="#000000"
                        onChange={(e) => {
                          const textarea = document.getElementById('editContent') as HTMLTextAreaElement;
                          if (textarea) {
                            textarea.style.color = e.target.value;
                          }
                        }}
                        className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                    
                    <button
                      onClick={() => {
                        const textarea = document.getElementById('editContent') as HTMLTextAreaElement;
                        if (textarea) {
                          textarea.style.fontSize = '14px';
                          textarea.style.color = '#000000';
                        }
                      }}
                      className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs whitespace-nowrap"
                    >
                      <i className="ri-refresh-line mr-1"></i>
                      重置格式
                    </button>
                  </div>
                  
                  <textarea
                    id="editContent"
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                    placeholder="请输入帖子内容"
                    rows={6}
                    maxLength={1000}
                    className="w-full px-3 py-2 border border-gray-300 border-t-0 rounded-b-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ fontSize: '14px', color: '#000000' }}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {editingPost.content.length}/1000
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="editIsForSale"
                      checked={editingPost.isForSale}
                      onChange={(e) => setEditingPost({...editingPost, isForSale: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="editIsForSale" className="text-sm font-medium text-gray-700">
                      这是付费内容
                    </label>
                  </div>

                  {editingPost.isForSale && (
                    <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          商品价格 (元)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingPost.price || ''}
                          onChange={(e) => setEditingPost({...editingPost, price: parseFloat(e.target.value) || 0})}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          付费内容详情
                        </label>
                        <textarea
                          value={editingPost.soldContent || ''}
                          onChange={(e) => setEditingPost({...editingPost, soldContent: e.target.value})}
                          placeholder="购买后用户可看到的详细内容，如联系方式、具体配置等"
                          rows={4}
                          maxLength={500}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {(editingPost.soldContent || '').length}/500
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditPostModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleUpdatePost}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg whitespace-nowrap"
                  >
                    保存修改
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
