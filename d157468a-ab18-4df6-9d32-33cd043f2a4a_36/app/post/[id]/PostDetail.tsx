'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Post, Reply, User, localStorageUtils } from '@/lib/mockData';
import toast, { Toaster } from 'react-hot-toast';

interface PostDetailProps {
  postId: string;
}

export default function PostDetail({ postId }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showManageMenu, setShowManageMenu] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const posts = localStorageUtils.getPosts();
    const foundPost = posts.find(p => p.id === postId);
    
    if (!foundPost) {
      router.push('/not-found');
      return;
    }
    
    setPost(foundPost);
    
    const user = localStorageUtils.getCurrentUser();
    setCurrentUser(user);
    
    // 检查是否已购买付费内容（这里简化处理，实际应该从数据库查询）
    if (user && foundPost.isForSale) {
      const purchased = localStorage.getItem(`purchased_${user.id}_${postId}`);
      setHasPurchased(!!purchased);
    }
    
    setLoading(false);
  }, [postId, router]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('请先登录');
      router.push('/login');
      return;
    }
    
    if (!replyContent.trim()) {
      toast.error('请输入回复内容');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const posts = localStorageUtils.getPosts();
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex === -1) {
        toast.error('帖子不存在');
        return;
      }
      
      const newReply: Reply = {
        id: Date.now().toString(),
        postId,
        content: replyContent.trim(),
        authorId: currentUser.id,
        authorName: currentUser.username,
        createTime: new Date().toLocaleString()
      };
      
      posts[postIndex].replies.push(newReply);
      localStorageUtils.savePosts(posts);
      
      setPost(posts[postIndex]);
      setReplyContent('');
      toast.success('回复成功');
      
    } catch (error) {
      toast.error('回复失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinToggle = () => {
    if (!post || !currentUser?.isAdmin) return;
    
    const posts = localStorageUtils.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) return;
    
    if (posts[postIndex].isPinned) {
      posts[postIndex].isPinned = false;
      posts[postIndex].pinnedLevel = 0;
      toast.success('已取消置顶');
    } else {
      posts[postIndex].isPinned = true;
      posts[postIndex].pinnedLevel = 2; // 管理员置顶
      toast.success('已设置置顶');
    }
    
    localStorageUtils.savePosts(posts);
    setPost(posts[postIndex]);
    setShowManageMenu(false);
  };

  const handleColorTag = (color: string) => {
    if (!post || !currentUser?.isAdmin) return;
    
    const posts = localStorageUtils.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) return;
    
    posts[postIndex].colorTag = posts[postIndex].colorTag === color ? undefined : color;
    localStorageUtils.savePosts(posts);
    setPost(posts[postIndex]);
    setShowManageMenu(false);
    toast.success('标记已更新');
  };

  const handleDelete = () => {
    if (!post || !currentUser?.isAdmin) return;
    
    if (confirm('确定要删除这个帖子吗？')) {
      const posts = localStorageUtils.getPosts();
      const filteredPosts = posts.filter(p => p.id !== postId);
      localStorageUtils.savePosts(filteredPosts);
      toast.success('帖子已删除');
      router.push('/');
    }
  };

  const handlePurchase = () => {
    if (!currentUser) {
      toast.error('请先登录');
      router.push('/login');
      return;
    }
    
    if (!post || !post.isForSale) return;
    
    // 简化的购买逻辑，实际应该扣除积分
    const purchasePrice = 10; // 固定10积分
    
    if (currentUser.points < purchasePrice) {
      toast.error('积分不足');
      return;
    }
    
    if (confirm(`确定花费${purchasePrice}积分购买此内容吗？`)) {
      // 扣除积分
      const users = localStorageUtils.getUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].points -= purchasePrice;
        localStorageUtils.saveUsers(users);
        localStorageUtils.saveCurrentUser(users[userIndex]);
        setCurrentUser(users[userIndex]);
      }
      
      // 记录购买状态
      localStorage.setItem(`purchased_${currentUser.id}_${postId}`, 'true');
      setHasPurchased(true);
      toast.success('购买成功');
    }
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

  if (!post) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">帖子不存在</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toaster position="top-center" />
      
      <div className="h-full flex flex-col">
        {/* 帖子内容 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* 返回按钮 */}
            <div className="mb-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <i className="ri-arrow-left-line"></i>
                <span>返回列表</span>
              </button>
            </div>

            {/* 帖子标题和作者信息 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                {post.isPinned && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <i className="ri-pushpin-fill mr-1"></i>
                    置顶
                  </span>
                )}
                {post.isForSale && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <i className="ri-price-tag-3-fill mr-1"></i>
                    付费内容
                  </span>
                )}
              </div>
              
              <h1 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h1>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <i className="ri-user-line"></i>
                    {post.authorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="ri-time-line"></i>
                    {post.createTime}
                  </span>
                </div>
                
                {post.price && (
                  <div className="text-xl font-bold text-red-600">
                    ¥{post.price.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* 帖子内容 */}
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {post.content}
                </p>
                
                {post.isForSale && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {hasPurchased ? (
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-green-800 font-medium mb-2">已购买内容：</p>
                        <p className="text-gray-700">{post.soldContent}</p>
                      </div>
                    ) : (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-blue-800 font-medium mb-2">此内容为出售内容</p>
                        <p className="text-gray-600 mb-3">购买后可查看完整内容</p>
                        <button
                          onClick={handlePurchase}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                        >
                          花费10积分购买
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 管理员功能 */}
            {currentUser?.isAdmin && (
              <div className="mb-6">
                <div className="relative">
                  <button
                    onClick={() => setShowManageMenu(!showManageMenu)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                  >
                    <i className="ri-settings-line mr-1"></i>
                    管理
                  </button>
                  
                  {showManageMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={handlePinToggle}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        {post.isPinned ? '取消置顶' : '设置置顶'}
                      </button>
                      <div className="px-3 py-2 text-xs text-gray-500 border-t">颜色标记</div>
                      <div className="flex gap-1 px-3 pb-2">
                        {['red', 'blue', 'green', 'yellow'].map(color => (
                          <button
                            key={color}
                            onClick={() => handleColorTag(color)}
                            className={`w-4 h-4 rounded-full border-2 ${
                              post.colorTag === color ? 'border-gray-800' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-3 py-2 hover:bg-red-50 text-sm text-red-600 border-t"
                      >
                        删除帖子
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 回复列表 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                回复 ({post.replies.length})
              </h3>
              
              {post.replies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无回复
                </div>
              ) : (
                post.replies.map((reply) => (
                  <div key={reply.id} className="bg-white border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{reply.authorName}</span>
                      <span className="text-sm text-gray-500">{reply.createTime}</span>
                    </div>
                    <p className="text-gray-700">{reply.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 回复输入框 */}
        <div className="border-t border-gray-200 bg-white p-4">
          {currentUser ? (
            <form onSubmit={handleReplySubmit} className="flex gap-3">
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="写下你的回复..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {replyContent.length}/500
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <button
                  type="submit"
                  disabled={submitting || !replyContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
                >
                  {submitting ? '发送中...' : '发送'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">请登录后参与讨论</p>
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium whitespace-nowrap"
              >
                立即登录
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}