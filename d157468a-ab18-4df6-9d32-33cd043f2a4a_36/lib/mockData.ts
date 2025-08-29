export interface User {
  id: string;
  username: string;
  password: string;
  email?: string;
  registerTime: string;
  lastLoginTime: string;
  loginIP: string;
  points: number;
  isAdmin: boolean;
  isActive: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  price?: number;
  authorId: string;
  authorName: string;
  createTime: string;
  isPinned: boolean;
  pinnedLevel: number; // 0: 无置顶, 1: 普通置顶, 2: 管理员置顶, 3: 永久置顶
  colorTag?: string;
  isForSale: boolean;
  soldContent?: string;
  replies: Reply[];
}

export interface Reply {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  createTime: string;
}

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    registerTime: '2024-01-01 10:00:00',
    lastLoginTime: '2024-01-20 15:30:00',
    loginIP: '192.168.1.100',
    points: 1000,
    isAdmin: true,
    isActive: true
  },
  {
    id: '2',
    username: '张三',
    password: '123456',
    registerTime: '2024-01-05 14:20:00',
    lastLoginTime: '2024-01-19 09:15:00',
    loginIP: '192.168.1.101',
    points: 150,
    isAdmin: false,
    isActive: true
  },
  {
    id: '3',
    username: '李四',
    password: '123456',
    registerTime: '2024-01-10 16:45:00',
    lastLoginTime: '2024-01-18 20:00:00',
    loginIP: '192.168.1.102',
    points: 280,
    isAdmin: false,
    isActive: true
  }
];

// 模拟帖子数据
export const mockPosts: Post[] = [
  {
    id: '2',
    title: 'MacBook Pro M3 14寸 512GB 9成新',
    content: 'MacBook Pro M3 14寸，512GB存储，9成新，无磕碰无维修。此内容为出售内容，购买后可查看详细配置和联系方式。',
    price: 12800,
    authorId: '2',
    authorName: '张三',
    createTime: '2024-01-19 15:20:00',
    isPinned: false,
    pinnedLevel: 0,
    isForSale: true,
    soldContent: '详细配置：M3芯片、16GB内存、512GB SSD。购买时间2023年10月，发票齐全。联系QQ：987654321',
    replies: []
  },
  {
    id: '3',
    title: '小米13 Ultra 黑色 256GB 个人自用',
    content: '小米13 Ultra 黑色256GB，个人自用9个月，成色很好。此内容为出售内容，包含徕卡相机套装。',
    price: 3200,
    authorId: '3',
    authorName: '李四',
    createTime: '2024-01-18 20:15:00',
    isPinned: false,
    pinnedLevel: 0,
    isForSale: true,
    soldContent: '包含原装充电器、数据线、保护壳。徕卡相机套装完整。微信：xiaomi_seller',
    replies: [
      {
        id: '3',
        postId: '3',
        content: '电池健康度怎么样？',
        authorId: '1',
        authorName: 'admin',
        createTime: '2024-01-19 08:00:00'
      }
    ]
  },
  {
    id: '4',
    title: 'Nintendo Switch OLED 白色 全套配件',
    content: 'Nintendo Switch OLED 白色版本，全套原装配件，购买6个月。此内容为出售内容。',
    price: 1800,
    authorId: '2',
    authorName: '张三',
    createTime: '2024-01-17 14:30:00',
    isPinned: false,
    pinnedLevel: 0,
    isForSale: true,
    soldContent: '包含主机、手柄、充电器、说明书等全套配件。送10个游戏卡带。QQ：switch_game',
    replies: []
  },
  {
    id: '5',
    title: 'iPad Air 5 64GB WiFi版 银色',
    content: 'iPad Air 5代 64GB WiFi版银色，购买1年，平时主要看视频用。此内容为出售内容。',
    price: 3500,
    authorId: '3',
    authorName: '李四',
    createTime: '2024-01-16 11:45:00',
    isPinned: false,
    pinnedLevel: 0,
    isForSale: true,
    soldContent: '配原装充电器和数据线，送钢化膜和保护套。成色95新。联系方式：ipad_seller@email.com',
    replies: []
  }
];

// 本地存储工具函数
export const localStorageUtils = {
  getUsers: (): User[] => {
    const stored = localStorage.getItem('forum_users');
    return stored ? JSON.parse(stored) : mockUsers;
  },
  
  saveUsers: (users: User[]) => {
    localStorage.setItem('forum_users', JSON.stringify(users));
  },
  
  getPosts: (): Post[] => {
    const stored = localStorage.getItem('forum_posts');
    return stored ? JSON.parse(stored) : mockPosts;
  },
  
  savePosts: (posts: Post[]) => {
    localStorage.setItem('forum_posts', JSON.stringify(posts));
  },
  
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem('forum_user');
    return stored ? JSON.parse(stored) : null;
  },
  
  saveCurrentUser: (user: User) => {
    localStorage.setItem('forum_user', JSON.stringify(user));
  },
  
  logout: () => {
    localStorage.removeItem('forum_user');
  }
};