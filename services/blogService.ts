import { BlogPost, PostStatus, Category } from '../types';
import { supabase } from './supabaseClient';

const STORAGE_KEY_CATEGORIES = 'lumina_categories';

// Hardcoded categories for now (can be moved to DB later if needed)
const SEED_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'SEO', slug: 'seo' },
  { id: 'cat2', name: 'Social', slug: 'social' },
  { id: 'cat3', name: 'Content', slug: 'content' },
  { id: 'cat4', name: 'Strategy', slug: 'strategy' },
  { id: 'cat5', name: 'Analytics', slug: 'analytics' },
  { id: 'cat6', name: 'ROI', slug: 'roi' },
  { id: 'cat7', name: 'Trends', slug: 'trends' },
];

// Initialize categories in local storage if not present (hybrid approach for config data)
if (!localStorage.getItem(STORAGE_KEY_CATEGORIES)) {
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(SEED_CATEGORIES));
}

// --- Helper: Convert DB Row to Frontend Type ---
const mapRowToPost = (row: any): BlogPost => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt || '',
  featuredImage: row.featured_image || '',
  authorId: row.author_id,
  authorName: row.author_name,
  publishedAt: row.published_at,
  scheduledFor: row.scheduled_for,
  status: row.status as PostStatus,
  blocks: row.blocks || [], // JSONB comes back as object/array automatically
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
  published_at: post.publishedAt,
  scheduled_for: post.scheduledFor,
  status: post.status,
  blocks: post.blocks, // Supabase client handles JSON stringification for JSONB columns
  seo: post.seo,
  reading_time_minutes: post.readingTimeMinutes,
  tags: post.tags,
  category: post.category
});

// --- API Methods ---

export const getPosts = async (status?: PostStatus): Promise<BlogPost[]> => {
  let query = supabase
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    // Throw error so the UI knows something went wrong (e.g. invalid key or permissions)
    throw new Error(error.message);
  }

  return (data || []).map(mapRowToPost);
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching post by slug:', error);
    return undefined;
  }

  return mapRowToPost(data);
};

export const getPostById = async (id: string): Promise<BlogPost | undefined> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching post by id:', error);
    // Don't throw here to allow "New Post" flow to work gracefully if ID not found
    return undefined;
  }

  return mapRowToPost(data);
};

export const savePost = async (post: BlogPost): Promise<BlogPost> => {
  // Calculate reading time before saving
  const text = post.blocks.map(b => b.content).join(' ');
  const wordCount = text.split(/\s+/).length;
  post.readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const dbRow = mapPostToRow(post);

  // Upsert: Updates if ID exists, Inserts if it doesn't
  const { data, error } = await supabase
    .from('posts')
    .upsert(dbRow)
    .select()
    .single();

  if (error) {
    console.error('Error saving post:', error);
    throw new Error(error.message);
  }

  return mapRowToPost(data);
};

export const deletePost = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting post:', error);
    throw new Error(error.message);
  }
};

export const getCategories = async (): Promise<Category[]> => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES) || '[]');
};