export type UserRole = 'admin' | 'editor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'code' | 'quote' | 'list';
  content: string; // HTML, text, or JSON string for lists
  metadata?: {
    alt?: string; // For images
    language?: string; // For code
    level?: 1 | 2 | 3 | 4 | 5 | 6; // For headings
    caption?: string;
    image?: string; // For headings or other blocks allowing attached images
  };
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
}

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  authorId: string;
  authorName: string;
  authorTitle?: string; // New field for role (e.g. SEO Specialist)
  publishedAt: string | null; // ISO Date string
  scheduledFor?: string | null;
  status: PostStatus;
  blocks: ContentBlock[];
  seo: SEOData;
  readingTimeMinutes: number;
  tags: string[];
  category: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

// Gemini Types
export interface AISuggestion {
  title: string;
  excerpt: string;
  seo: SEOData;
}