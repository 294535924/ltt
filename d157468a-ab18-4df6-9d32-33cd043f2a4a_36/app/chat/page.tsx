'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { User, localStorageUtils } from '@/lib/mockData';
import toast, { Toaster } from 'react-hot-toast';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  type: 'text' | 'image';
}

interface ChatUser {
  id: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 模拟聊天用户数据
  const mockChatUsers: ChatUser[] = [
    {
      id: '2',
      username: '张三',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20business%20person%20avatar%20headshot%20portrait%20clean%20background%20modern%20style&width=100&height=100&seq=avatar1&orientation=squarish',
      isOnline: true,
      lastMessage: '好的，我看看',
      lastMessageTime: '15:30',
      unreadCount: 2
    },
    {
      id: '3',
      username: '李四',
      avatar: 'https://readdy.ai/api/search-image?query=friendly%20professional%20person%20avatar%20headshot%20portrait%20clean%20background%20modern%20style&width=100&height=100&seq=avatar2&orientation=squarish',
      isOnline: false,
      lastMessage: '图片收到了',
      lastMessageTime: '昨天',
      unreadCount: 0
    },
    {
      id: '4',
      username: '王五',
      avatar: 'https://readdy.ai/api/search-image?query=business%20professional%20avatar%20headshot%20portrait%20clean%20background%20modern%20style&width=100&height=100&seq=avatar3&orientation=squarish',
      isOnline: true,
      lastMessage: '这个价格可以商量吗？',
      lastMessageTime: '14:20',
      unreadCount: 1
    }
  ];

  // 模拟聊天消息数据
  const mockMessages: { [key: string]: ChatMessage[] } = {
    '2': [
      {
        id: '1',
        senderId: '2',
        senderName: '张三',
        content: '你好，MacBook还在吗？',
        timestamp: '14:30',
        type: 'text'
      },
      {
        id: '2',
        senderId: '1',
        senderName: 'admin',
        content: '在的，需要看详细图片吗',
        timestamp: '14:32',
        type: 'text'
      },
      {
        id: '3',
        senderId: '1',
        senderName: 'admin',
        content: '',
        imageUrl: 'https://readdy.ai/api/search-image?query=MacBook%20Pro%20laptop%20computer%20modern%20sleek%20design%20silver%20color%20clean%20background%20product%20photography%20high%20quality%20professional%20lighting&width=400&height=300&seq=macbook1&orientation=landscape',
        timestamp: '14:33',
        type: 'image'
      },
      {
        id: '4',
        senderId: '2',
        senderName: '张三',
        content: '好的，我看看',
        timestamp: '15:30',
        type: 'text'
      }
    ],
    '3': [
      {
        id: '5',
        senderId: '3',
        senderName: '李四',
        content: '小米手机的照片能发一下吗',
        timestamp: '昨天 20:15',
        type: 'text'
      },
      {
        id: '6',
        senderId: '1',
        senderName: 'admin',
        content: '',
        imageUrl: 'https://readdy.ai/api/search-image?query=Xiaomi%20smartphone%20mobile%20phone%20black%20color%20modern%20design%20clean%20background%20product%20photography%20professional%20lighting%20high%20quality&width=300&height=400&seq=xiaomi1&orientation=portrait',
        timestamp: '昨天 20:20',
        type: 'image'
      },
      {
        id: '7',
        senderId: '3',
        senderName: '李四',
        content: '图片收到了',
        timestamp: '昨天 20:25',
        type: 'text'
      }
    ],
    '4': [
      {
        id: '8',
        senderId: '4',
        senderName: '王五',
        content: 'Switch还有吗？',
        timestamp: '14:10',
        type: 'text'
      },
      {
        id: '9',
        senderId: '1',
        senderName: 'admin',
        content: '有的，要的话可以优惠一点',
        timestamp: '14:15',
        type: 'text'
      },
      {
        id: '10',
        senderId: '4',
        senderName: '王五',
        content: '这个价格可以商量吗？',
        timestamp: '14:20',
        type: 'text'
      }
    ]
  };

  useEffect(() => {
    const user = localStorageUtils.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    setCurrentUser(user);
    setChatUsers(mockChatUsers);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (selectedUserId && mockMessages[selectedUserId]) {
      setMessages(mockMessages[selectedUserId]);
    } else {
      setMessages([]);
    }
    
    // 标记消息为已读
    if (selectedUserId) {
      setChatUsers(prev => prev.map(user => 
        user.id === selectedUserId ? { ...user, unreadCount: 0 } : user
      ));
    }
  }, [selectedUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedUserId) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser!.id,
      senderName: currentUser!.username,
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'text'
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // 更新聊天列表的最后消息
    setChatUsers(prev => prev.map(user => 
      user.id === selectedUserId 
        ? { 
            ...user, 
            lastMessage: newMessage.trim(),
            lastMessageTime: '刚刚'
          }
        : user
    ));
    
    toast.success('消息已发送');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setPreviewImage(imageUrl);
      setShowImagePreview(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSendImage = () => {
    if (!previewImage || !selectedUserId) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser!.id,
      senderName: currentUser!.username,
      content: '',
      imageUrl: previewImage,
      timestamp: new Date().toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'image'
    };
    
    setMessages(prev => [...prev, message]);
    setShowImagePreview(false);
    setPreviewImage(null);
    
    // 更新聊天列表的最后消息
    setChatUsers(prev => prev.map(user => 
      user.id === selectedUserId 
        ? { 
            ...user, 
            lastMessage: '[图片]',
            lastMessageTime: '刚刚'
          }
        : user
    ));
    
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast.success('图片已发送');
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
      
      <div className="h-full flex">
        {/* 聊天用户列表 */}
        <div className="w-1/3 border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">消息</h2>
          </div>
          
          <div className="overflow-y-auto">
            {chatUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedUserId === user.id ? 'bg-blue-50 border-blue-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">{user.username}</h3>
                      <span className="text-xs text-gray-500">{user.lastMessageTime}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">{user.lastMessage}</p>
                      {user.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                          {user.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 聊天界面 */}
        <div className="flex-1 flex flex-col">
          {selectedUserId ? (
            <>
              {/* 聊天头部 */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={chatUsers.find(u => u.id === selectedUserId)?.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {chatUsers.find(u => u.id === selectedUserId)?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {chatUsers.find(u => u.id === selectedUserId)?.username}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {chatUsers.find(u => u.id === selectedUserId)?.isOnline ? '在线' : '离线'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 消息区域 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${
                      message.senderId === currentUser?.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-900 border border-gray-200'
                    } rounded-lg p-3 shadow-sm`}>
                      {message.type === 'text' ? (
                        <p className="text-sm">{message.content}</p>
                      ) : (
                        <div>
                          <img
                            src={message.imageUrl}
                            alt="聊天图片"
                            className="max-w-full h-auto rounded-lg cursor-pointer"
                            onClick={() => {
                              setPreviewImage(message.imageUrl!);
                              setShowImagePreview(true);
                            }}
                          />
                        </div>
                      )}
                      <div className={`text-xs mt-1 ${
                        message.senderId === currentUser?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <i className="ri-image-line text-xl"></i>
                  </button>
                  
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="输入消息..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={1}
                      maxLength={500}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full transition-colors"
                  >
                    <i className="ri-send-plane-fill"></i>
                  </button>
                </form>
              </div>

              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-chat-3-line text-4xl"></i>
                </div>
                <p className="text-lg">选择一个对话开始聊天</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 图片预览弹窗 */}
      {showImagePreview && previewImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium">图片预览</h3>
              <button
                onClick={() => {
                  setShowImagePreview(false);
                  setPreviewImage(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="p-4">
              <img
                src={previewImage}
                alt="预览图片"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImagePreview(false);
                  setPreviewImage(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium whitespace-nowrap"
              >
                取消
              </button>
              <button
                onClick={handleSendImage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium whitespace-nowrap"
              >
                发送图片
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}