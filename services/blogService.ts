import { BlogPost, PostStatus, Category, ContentBlock } from '../types';

const STORAGE_KEY_POSTS = 'lumina_posts';
const STORAGE_KEY_CATEGORIES = 'lumina_categories';

// Seed Data matching the modern layout
const SEED_POSTS: BlogPost[] = [
  {
    id: 'featured-seo',
    title: 'Elevate Your SEO Game Today',
    slug: 'elevate-your-seo-game',
    excerpt: "Discover effective SEO strategies that will boost your website's visibility and drive organic traffic. Learn tips and tricks from our experts.",
    featuredImage: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop', // Office setting
    authorId: 'james',
    authorName: 'James Anderson',
    publishedAt: '2025-01-22T10:00:00Z',
    status: PostStatus.PUBLISHED,
    readingTimeMinutes: 5,
    tags: ['SEO', 'Marketing'],
    category: 'SEO',
    seo: {
      metaTitle: 'Elevate Your SEO Game Today',
      metaDescription: 'Boost your website visibility with effective SEO strategies.',
      keywords: ['seo', 'organic traffic', 'strategies'],
    },
    blocks: [
      { id: 'b1', type: 'paragraph', content: 'SEO is the backbone of digital visibility.' }
    ]
  },
  {
    id: 'post-social',
    title: 'Creating Engaging Social Media Content',
    slug: 'engaging-social-media-content',
    excerpt: 'Learn how to craft compelling social media content that captures attention and drives engagement. Our guide covers best practices and creative ideas.',
    featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop', // Hands typing analytics
    authorId: 'emily',
    authorName: 'Emily Johnson',
    publishedAt: '2025-02-22T10:00:00Z',
    status: PostStatus.PUBLISHED,
    readingTimeMinutes: 4,
    tags: ['Social Media'],
    category: 'Social',
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
    blocks: []
  },
  {
    id: 'post-content',
    title: 'The Power of Content Marketing',
    slug: 'power-of-content-marketing',
    excerpt: 'Unleash the potential of content marketing to connect with your audience. Discover how quality content can drive traffic and boost conversions.',
    featuredImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2070&auto=format&fit=crop', // Presentation
    authorId: 'michael',
    authorName: 'Michael Brown',
    publishedAt: '2025-03-22T10:00:00Z',
    status: PostStatus.PUBLISHED,
    readingTimeMinutes: 6,
    tags: ['Content', 'Marketing'],
    category: 'Content',
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
    blocks: []
  },
  {
    id: 'post-strategy',
    title: 'Digital Strategy for Small Businesses',
    slug: 'digital-strategy-small-business',
    excerpt: 'Explore tailored digital strategies designed to help small businesses succeed online. Learn how to reach your target audience effectively.',
    featuredImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop', // Meeting
    authorId: 'sarah',
    authorName: 'Sarah Williams',
    publishedAt: '2025-04-22T10:00:00Z',
    status: PostStatus.PUBLISHED,
    readingTimeMinutes: 7,
    tags: ['Strategy', 'Business'],
    category: 'Strategy',
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
    blocks: []
  },
  {
    id: 'post-analytics',
    title: 'Measuring Success with Analytics',
    slug: 'measuring-success-analytics',
    excerpt: 'Understand the importance of analytics in digital marketing. Learn how to track, measure, and optimize your campaigns for better results.',
    featuredImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop', // Analytics screen
    authorId: 'david',
    authorName: 'David Anderson',
    publishedAt: '2025-05-22T10:00:00Z',
    status: PostStatus.PUBLISHED,
    readingTimeMinutes: 5,
    tags: ['Analytics', 'Data'],
    category: 'Analytics',
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
    blocks: []
  },
  {
    id: 'post-roi',
    title: 'Maximizing ROI in Digital Campaigns',
    slug: 'maximizing-roi-digital-campaigns',
    excerpt: 'Discover techniques to maximize your return on investment in digital marketing campaigns. Share insights on budget allocation and optimization.',
    featuredImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop', // Charts
    authorId: 'laura',
    authorName: 'Laura Davis',
    publishedAt: '2025-06-22T10:00:00Z',
    status: PostStatus.PUBLISHED,
    readingTimeMinutes: 8,
    tags: ['ROI', 'Business'],
    category: 'ROI',
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
    blocks: []
  },
  {
    id: 'post-trends',
    title: 'Trends in Digital Marketing 2025',
    slug: 'trends-digital-marketing-2025',
    excerpt: 'Stay ahead of the curve with the latest trends in digital marketing. Learn what\'s shaping the industry and how to adapt your strategies accordingly.',
    featuredImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop', // Modern office
    authorId: 'richard',
    authorName: 'Richard Wilson',
    publishedAt: '2025-07-22T10:00:00Z',
    status: PostStatus.PUBLISHED,
    readingTimeMinutes: 6,
    tags: ['Trends', 'Future'],
    category: 'Trends',
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
    blocks: []
  }
];

const SEED_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'SEO', slug: 'seo' },
  { id: 'cat2', name: 'Social', slug: 'social' },
  { id: 'cat3', name: 'Content', slug: 'content' },
  { id: 'cat4', name: 'Strategy', slug: 'strategy' },
  { id: 'cat5', name: 'Analytics', slug: 'analytics' },
];

// Initialize storage if empty
if (!localStorage.getItem(STORAGE_KEY_POSTS)) {
  localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(SEED_POSTS));
}
if (!localStorage.getItem(STORAGE_KEY_CATEGORIES)) {
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(SEED_CATEGORIES));
}

// API Methods
export const getPosts = async (status?: PostStatus): Promise<BlogPost[]> => {
  await new Promise(r => setTimeout(r, 300)); // Simulate net lag
  const posts: BlogPost[] = JSON.parse(localStorage.getItem(STORAGE_KEY_POSTS) || '[]');
  if (status) {
    return posts.filter(p => p.status === status);
  }
  // Sort by ID to keep the specific order from the image for this demo
  const order = ['featured-seo', 'post-social', 'post-content', 'post-strategy', 'post-analytics', 'post-roi', 'post-trends'];
  return posts.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  const posts = await getPosts();
  return posts.find(p => p.slug === slug);
};

export const getPostById = async (id: string): Promise<BlogPost | undefined> => {
  const posts = await getPosts();
  return posts.find(p => p.id === id);
};

export const savePost = async (post: BlogPost): Promise<BlogPost> => {
  const posts = await getPosts();
  const index = posts.findIndex(p => p.id === post.id);
  
  const text = post.blocks.map(b => b.content).join(' ');
  const wordCount = text.split(/\s+/).length;
  post.readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  if (index >= 0) {
    posts[index] = post;
  } else {
    posts.push(post);
  }
  localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
  return post;
};

export const deletePost = async (id: string): Promise<void> => {
  const posts = await getPosts();
  const filtered = posts.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(filtered));
};

export const getCategories = async (): Promise<Category[]> => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES) || '[]');
};