
'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Post, localStorageUtils } from '@/lib/mockData';
import Link from 'next/link';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初始化数据
    const storedPosts = localStorageUtils.getPosts();
    localStorageUtils.savePosts(storedPosts);
    
    const storedUsers = localStorageUtils.getUsers();
    localStorageUtils.saveUsers(storedUsers);
    
    // 按置顶级别和时间排序
    const sortedPosts = storedPosts.sort((a, b) => {
      if (a.pinnedLevel !== b.pinnedLevel) {
        return b.pinnedLevel - a.pinnedLevel;
      }
      return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
    });
    
    setPosts(sortedPosts);
    setLoading(false);
  }, []);

  const getColorTagStyle = (colorTag?: string) => {
    switch (colorTag) {
      case 'red': return 'border-l-4 border-red-500';
      case 'blue': return 'border-l-4 border-blue-500';
      case 'green': return 'border-l-4 border-green-500';
      case 'yellow': return 'border-l-4 border-yellow-500';
      default: return '';
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

  return (
    <Layout>
      <div className="h-full overflow-y-auto">
        <div className="p-4 space-y-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`}>
              <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer ${getColorTagStyle(post.colorTag)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 line-clamp-1">
                      {post.title}
                    </h3>
                  </div>
                  {post.price && (
                    <div className="ml-4 text-right">
                      <div className="text-lg font-bold text-red-600">
                        ¥{post.price.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}