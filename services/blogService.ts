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
  authorTitle: row.author_title || 'Author', // Default to 'Author' if missing
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
  author_title: post.authorTitle,
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

  if (status === PostStatus.PUBLISHED) {
    // Return posts that are explicitly published OR scheduled posts that are past their scheduled date
    const now = new Date().toISOString();
    // Syntax: status.eq.published,and(status.eq.scheduled,scheduled_for.lte.NOW)
    query = query.or(`status.eq.${PostStatus.PUBLISHED},and(status.eq.${PostStatus.SCHEDULED},scheduled_for.lte.${now})`);
  } else if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    // Throw error so the UI knows something went wrong (e.g. invalid key or permissions)
    throw new Error(error.message);
  }

  // Auto-publish logic: Check for scheduled posts that are due
  const now = new Date();
  const postsToUpdate = (data || []).filter((row: any) => 
    row.status === PostStatus.SCHEDULED && 
    row.scheduled_for && 
    new Date(row.scheduled_for) <= now
  );

  if (postsToUpdate.length > 0) {
    // 1. Update local objects so UI reflects change immediately
    postsToUpdate.forEach((row: any) => {
      row.status = PostStatus.PUBLISHED;
    });

    // 2. Persist to Database (fire and forget to not block UI)
    Promise.all(postsToUpdate.map((row: any) => 
      supabase.from('posts').update({ status: PostStatus.PUBLISHED }).eq('id', row.id)
    )).catch(err => console.error("Error auto-publishing posts:", err));
  }

  return (data || []).map(mapRowToPost);
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  const nowStr = new Date().toISOString();
  
  // For public access, strictly fetch only visible posts
  // This query might return nothing if the post exists but is a draft
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .or(`status.eq.${PostStatus.PUBLISHED},and(status.eq.${PostStatus.SCHEDULED},scheduled_for.lte.${nowStr})`)
    .single();

  if (error) {
    // If it's just not found or filtered out, valid case.
    if (error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
       console.error('Error fetching post by slug:', error);
    }
    return undefined;
  }

  // Auto-publish if needed
  if (data.status === PostStatus.SCHEDULED && data.scheduled_for && new Date(data.scheduled_for) <= new Date()) {
    data.status = PostStatus.PUBLISHED;
    supabase.from('posts').update({ status: PostStatus.PUBLISHED }).eq('id', data.id)
      .then(({ error }) => { if (error) console.error("Error auto-publishing post:", error); });
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

  // Auto-publish if needed (even in admin editor)
  if (data.status === PostStatus.SCHEDULED && data.scheduled_for && new Date(data.scheduled_for) <= new Date()) {
    data.status = PostStatus.PUBLISHED;
    supabase.from('posts').update({ status: PostStatus.PUBLISHED }).eq('id', data.id);
  }

  return mapRowToPost(data);
};

export const getRelatedPosts = async (currentPostId: string, category: string): Promise<BlogPost[]> => {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    // Ensure related posts are also publicly visible
    .or(`status.eq.${PostStatus.PUBLISHED},and(status.eq.${PostStatus.SCHEDULED},scheduled_for.lte.${now})`)
    .eq('category', category)
    .neq('id', currentPostId)
    .limit(3);

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  // Auto-publish logic for related posts list
  const postsToUpdate = (data || []).filter((row: any) => 
    row.status === PostStatus.SCHEDULED && 
    row.scheduled_for && 
    new Date(row.scheduled_for) <= new Date()
  );

  if (postsToUpdate.length > 0) {
    postsToUpdate.forEach((row: any) => { row.status = PostStatus.PUBLISHED; });
    Promise.all(postsToUpdate.map((row: any) => 
      supabase.from('posts').update({ status: PostStatus.PUBLISHED }).eq('id', row.id)
    )).catch(err => console.error("Error auto-publishing related posts:", err));
  }

  return (data || []).map(mapRowToPost);
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