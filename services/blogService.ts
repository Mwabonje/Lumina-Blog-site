import { BlogPost, PostStatus, Category, ContentBlock } from '../types';
import { insforge } from './insforgeClient';

const STORAGE_KEY_CATEGORIES = 'lumina_categories';

// Hardcoded categories
const SEED_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'SEO', slug: 'seo' },
  { id: 'cat2', name: 'Social', slug: 'social' },
  { id: 'cat3', name: 'Content', slug: 'content' },
  { id: 'cat4', name: 'Strategy', slug: 'strategy' },
  { id: 'cat5', name: 'Analytics', slug: 'analytics' },
  { id: 'cat6', name: 'ROI', slug: 'roi' },
  { id: 'cat7', name: 'Trends', slug: 'trends' },
];

if (!localStorage.getItem(STORAGE_KEY_CATEGORIES)) {
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(SEED_CATEGORIES));
}

// --- Mock Data for Fallback (Read Only) ---
const MOCK_BLOCKS: ContentBlock[] = [
  { id: '1', type: 'paragraph', content: 'In the rapidly evolving landscape of digital marketing, staying ahead of the curve is not just an advantage; it is a necessity. As we move further into the decade, the integration of Artificial Intelligence (AI) and machine learning algorithms is reshaping how brands interact with their consumers.' },
  { id: '2', type: 'heading', content: 'The Rise of Hyper-Personalization', metadata: { level: 2 } },
  { id: '3', type: 'paragraph', content: 'Consumers today expect brands to understand their needs before they even articulate them. AI-driven data analytics allows marketers to create hyper-personalized experiences that resonate on a deeper level.' },
  { id: '4', type: 'quote', content: 'Marketing is no longer about the stuff that you make, but about the stories you tell.' },
  { id: '5', type: 'paragraph', content: 'However, with great power comes great responsibility. Data privacy remains a significant concern, and brands must navigate the fine line between personalization and intrusion.' },
  { id: '6', type: 'list', content: '["Transparent data policies are essential","User consent must be prioritized","Security protocols need regular updates"]' }
];

const MOCK_POSTS: BlogPost[] = [
  {
    id: 'mock-1',
    title: 'The Future of Digital Marketing: Trends to Watch in 2025',
    slug: 'future-digital-marketing-2025',
    excerpt: 'Artificial Intelligence, voice search, and hyper-personalization are reshaping the landscape. Here is what you need to know to stay ahead of the competition.',
    featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
    authorId: 'admin-1',
    authorName: 'Sarah Jenkins',
    authorTitle: 'Content Strategist',
    publishedAt: new Date(Date.now() - 10000000).toISOString(),
    status: PostStatus.PUBLISHED,
    category: 'Strategy',
    readingTimeMinutes: 5,
    tags: ['AI', 'Marketing', 'Trends'],
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
    blocks: MOCK_BLOCKS
  },
  {
    id: 'mock-2',
    title: 'Mastering SEO: Beyond Keywords',
    slug: 'mastering-seo-beyond-keywords',
    excerpt: 'Search engines are getting smarter. It is no longer just about keywords; it is about user intent, semantic search, and creating genuine value.',
    featuredImage: 'https://images.unsplash.com/photo-1557838923-2985c318be48?q=80&w=2031&auto=format&fit=crop',
    authorId: 'admin-1',
    authorName: 'David Chen',
    authorTitle: 'SEO Specialist',
    publishedAt: new Date(Date.now() - 20000000).toISOString(),
    status: PostStatus.PUBLISHED,
    category: 'SEO',
    readingTimeMinutes: 7,
    tags: ['SEO', 'Search', 'Google'],
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
    blocks: MOCK_BLOCKS
  },
  {
    id: 'mock-3',
    title: 'Content That Converts: A Guide',
    slug: 'content-that-converts',
    excerpt: 'Creating content is easy. Creating content that drives sales is an art form. Learn the psychological triggers that turn readers into customers.',
    featuredImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop',
    authorId: 'admin-1',
    authorName: 'Emily Rose',
    authorTitle: 'Copywriter',
    publishedAt: new Date(Date.now() - 30000000).toISOString(),
    status: PostStatus.PUBLISHED,
    category: 'Content',
    readingTimeMinutes: 4,
    tags: ['Copywriting', 'Sales', 'Conversion'],
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
    blocks: MOCK_BLOCKS
  },
  {
    id: 'mock-4',
    title: 'Social Media Algorithms Explained',
    slug: 'social-media-algorithms-explained',
    excerpt: 'Stop guessing and start growing. We break down how the major platforms prioritize content and how you can leverage it.',
    featuredImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop',
    authorId: 'admin-1',
    authorName: 'Michael Chang',
    authorTitle: 'Social Media Manager',
    publishedAt: new Date(Date.now() - 40000000).toISOString(),
    status: PostStatus.PUBLISHED,
    category: 'Social',
    readingTimeMinutes: 6,
    tags: ['Social Media', 'Instagram', 'Growth'],
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
    blocks: MOCK_BLOCKS
  }
];

// --- Helper: Convert DB Row to Frontend Type ---
const mapRowToPost = (row: any): BlogPost => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt || '',
  featuredImage: row.featured_image || '',
  authorId: row.author_id,
  authorName: row.author_name,
  authorTitle: row.author_title || 'Author',
  publishedAt: row.published_at,
  scheduledFor: row.scheduled_for,
  status: row.status as PostStatus,
  blocks: row.blocks || [],
  seo: row.seo || { metaTitle: '', metaDescription: '', keywords: [] },
  readingTimeMinutes: row.reading_time_minutes || 0,
  tags: row.tags || [],
  category: row.category || 'Uncategorized'
});

// --- Helper: Convert Frontend Type to DB Row ---
const mapPostToRow = (post: BlogPost) => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  featured_image: post.featuredImage,
  author_id: post.authorId,
  author_name: post.authorName,
  author_title: post.authorTitle,
  published_at: post.publishedAt,
  scheduled_for: post.scheduledFor,
  status: post.status,
  blocks: post.blocks,
  seo: post.seo,
  reading_time_minutes: post.readingTimeMinutes,
  tags: post.tags,
  category: post.category
});

// --- API Methods ---

export const getPosts = async (status?: PostStatus): Promise<BlogPost[]> => {
  try {
    let query = insforge.database
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (status === PostStatus.PUBLISHED) {
      const now = new Date().toISOString();
      query = query.or(`status.eq.${PostStatus.PUBLISHED},and(status.eq.${PostStatus.SCHEDULED},scheduled_for.lte.${now})`);
    } else if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Auto-publish logic for Real DB
    const now = new Date();
    const postsToUpdate = (data || []).filter((row: any) =>
      row.status === PostStatus.SCHEDULED &&
      row.scheduled_for &&
      new Date(row.scheduled_for) <= now
    );

    if (postsToUpdate.length > 0) {
      // Optimistically update local data
      postsToUpdate.forEach((row: any) => { row.status = PostStatus.PUBLISHED; });
      // Fire and forget update
      Promise.all(postsToUpdate.map((row: any) =>
        insforge.database.from('posts').update({ status: PostStatus.PUBLISHED }).eq('id', row.id)
      )).catch(err => console.warn("Auto-publish failed", err));
    }

    return (data || []).map(mapRowToPost);

  } catch (err) {
    console.warn("Connection error, using static mocks:", err);
    if (status) {
      return MOCK_POSTS.filter(p => p.status === status);
    }
    return MOCK_POSTS;
  }
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  try {
    const nowStr = new Date().toISOString();
    const { data, error } = await insforge.database
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .or(`status.eq.${PostStatus.PUBLISHED},and(status.eq.${PostStatus.SCHEDULED},scheduled_for.lte.${nowStr})`)
      .single();

    if (error) {
      // PGRST116 is code for 'no rows returned' in postgrest
      if ((error as any).code !== 'PGRST116') throw error;
      return undefined;
    }

    return mapRowToPost(data);
  } catch (err) {
    console.warn("Connection error, using static mocks:", err);
    return MOCK_POSTS.find(p => p.slug === slug);
  }
};

export const getPostById = async (id: string): Promise<BlogPost | undefined> => {
  try {
    const { data, error } = await insforge.database
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapRowToPost(data);
  } catch (err) {
    console.warn("Connection error, using static mocks:", err);
    return MOCK_POSTS.find(p => p.id === id);
  }
};

export const getRelatedPosts = async (currentPostId: string, category: string): Promise<BlogPost[]> => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await insforge.database
      .from('posts')
      .select('*')
      .or(`status.eq.${PostStatus.PUBLISHED},and(status.eq.${PostStatus.SCHEDULED},scheduled_for.lte.${now})`)
      .eq('category', category)
      .neq('id', currentPostId)
      .limit(3);

    if (error) throw error;
    return (data || []).map(mapRowToPost);
  } catch (err) {
    return MOCK_POSTS.filter(p => p.id !== currentPostId && p.category === category).slice(0, 3);
  }
};

export const savePost = async (post: BlogPost): Promise<BlogPost> => {
  const text = post.blocks.map(b => b.content).join(' ');
  const wordCount = text.split(/\s+/).length;
  post.readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const dbRow = mapPostToRow(post);

  const { data, error } = await insforge.database
    .from('posts')
    .upsert(dbRow)
    .select()
    .single();

  if (error) {
    console.error("InsForge Save Error:", error);
    const details = (error as any).details || (error as any).hint || '';
    throw new Error(`${error.message}${details ? ' - ' + details : ''} (Network check: ensure VITE_INSFORGE_URL is accessible)`);
  }
  return mapRowToPost(data);
};

export const deletePost = async (id: string): Promise<void> => {
  const { error } = await insforge.database
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("InsForge Delete Error:", error);
    throw new Error(error.message);
  }
};

export const getCategories = async (): Promise<Category[]> => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES) || '[]');
};