import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, ContentBlock } from '../../types';
import PublicLayout from '../layout/PublicLayout';
import SEOHead from '../ui/SEOHead';

interface ArticleTemplateProps {
  post: BlogPost;
  relatedPosts?: BlogPost[];
  previewMode?: boolean;
}

const ArticleTemplate: React.FC<ArticleTemplateProps> = ({ post, relatedPosts = [], previewMode = false }) => {
  
  // Helper to parse simple markdown to HTML for display
  const parseMarkdown = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*(?!\*)(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded text-red-500 font-mono text-sm">$1</code>');
  };

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'heading':
        const Tag = `h${block.metadata?.level || 2}` as React.ElementType;
        return (
          <div className="mt-16 mb-8">
            <Tag className="font-bold text-slate-900 dark:text-slate-50 leading-tight text-2xl md:text-3xl mb-6">
              {block.content}
            </Tag>
            {block.metadata?.image && (
              <img 
                src={block.metadata.image} 
                alt={block.content}
                className="w-full h-auto max-h-[500px] object-cover rounded-xl shadow-sm mt-6"
                loading="lazy"
              />
            )}
          </div>
        );
      case 'image':
        return (
          <figure className="my-10">
            <img 
              src={block.content} 
              alt={block.metadata?.alt || 'Blog image'} 
              className="w-full rounded-2xl shadow-md"
              loading="lazy"
            />
            {block.metadata?.caption && (
              <figcaption className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3 italic">{block.metadata.caption}</figcaption>
            )}
          </figure>
        );
      case 'code':
        return (
          <div className="my-10 rounded-lg overflow-hidden bg-[#0f172a] shadow-md border border-slate-800">
            <div className="flex gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
            </div>
            <pre className="p-6 overflow-x-auto text-sm font-mono text-slate-300">
              <code>{block.content}</code>
            </pre>
          </div>
        );
      case 'quote':
        return (
          <blockquote className="border-l-4 border-brand-blue pl-6 py-3 my-10 italic text-xl md:text-2xl text-slate-800 dark:text-slate-200 font-medium bg-blue-50/50 dark:bg-blue-900/10 rounded-r-lg leading-relaxed">
            "{block.content}"
          </blockquote>
        );
      case 'list':
        let items: string[] = [];
        try { items = JSON.parse(block.content); } catch (e) { items = []; }
        return (
          <ul className="list-disc pl-5 my-8 space-y-3 text-lg text-slate-700 dark:text-slate-300 leading-[1.8]">
            {items.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{__html: parseMarkdown(item)}} />
            ))}
          </ul>
        );
      default:
        // Paragraph: Also parse markdown here since we stopped converting on paste
        return <div dangerouslySetInnerHTML={{__html: parseMarkdown(block.content)}} className="mb-8 text-lg leading-[1.8] text-slate-700 dark:text-slate-300" />;
    }
  };

  return (
    <PublicLayout>
      <SEOHead 
        title={post.seo.metaTitle || post.title}
        description={post.seo.metaDescription || post.excerpt}
        image={post.seo.ogImage || post.featuredImage}
        canonicalUrl={post.seo.canonicalUrl}
        type="article"
        publishedAt={post.publishedAt || undefined}
        authorName={post.authorName}
        noIndex={previewMode} // Don't index previews
      />
      
      <article>
        {/* Header Section */}
        <div className="bg-[#020617] text-white py-20 relative overflow-hidden">
           <div className="absolute inset-0 bg-brand-blue/10"></div>
           {previewMode && (
             <div className="absolute top-0 left-0 w-full bg-yellow-500 text-black text-center text-xs font-bold py-2 z-50 shadow-md">
               PREVIEW MODE — This is how your post will look to readers
             </div>
           )}
           <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
             <div className="flex items-center justify-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-white/10 text-brand-blue text-xs font-bold uppercase tracking-wider border border-white/10">
                  {post.category || 'Uncategorized'}
                </span>
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                  {post.readingTimeMinutes} min read
                </span>
             </div>
             <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-8">
               {post.title || 'Untitled Post'}
             </h1>
             <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                   <img 
                     src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName || 'Admin')}&background=0ea5e9&color=fff`} 
                     alt={post.authorName} 
                     className="w-8 h-8 rounded-full border border-white/20" 
                   />
                   <div className="text-left">
                      <div className="font-medium text-sm leading-tight">{post.authorName || 'Admin'}</div>
                      <div className="text-xs text-brand-blue opacity-90">{post.authorTitle || 'Author'}</div>
                   </div>
                </div>
                <span className="text-gray-600">•</span>
                <time className="text-gray-400 text-sm">
                   {post.publishedAt 
                     ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                     : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
             </div>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 py-16">
          {/* Main Content */}
          <div className="md:col-span-8 md:col-start-3">
             {post.featuredImage && (
               <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-auto rounded-2xl shadow-xl mb-12 -mt-24 border-4 border-white dark:border-slate-800 relative z-20"
                  loading="lazy"
               />
             )}

             <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
              <p className="lead text-xl md:text-2xl text-slate-900 dark:text-slate-100 font-medium mb-12 leading-[1.8]">{post.excerpt}</p>
              {post.blocks.map(block => (
                <div key={block.id}>{renderBlock(block)}</div>
              ))}
            </div>

            <hr className="my-12 border-slate-200 dark:border-slate-800" />
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-secondary text-sm font-medium rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts Section */}
      {!previewMode && relatedPosts.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/50 py-20 border-t border-slate-200 dark:border-slate-800">
           <div className="max-w-7xl mx-auto px-6">
              <h3 className="text-2xl font-bold text-primary mb-10 text-center md:text-left">You might also like</h3>
              <div className="grid md:grid-cols-3 gap-8">
                 {relatedPosts.map(related => (
                   <Link key={related.id} to={`/blog/${related.slug}`} className="group block bg-surface rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 flex flex-col h-full">
                      <div className="h-48 overflow-hidden relative">
                         <img 
                           src={related.featuredImage} 
                           alt={related.title} 
                           className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                           loading="lazy"
                         />
                         <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-slate-900">
                            {related.category}
                         </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                         <h4 className="font-bold text-lg text-primary mb-3 leading-snug group-hover:text-brand-blue transition-colors">
                           {related.title}
                         </h4>
                         <p className="text-sm text-secondary line-clamp-2 mb-4 flex-grow">
                           {related.excerpt}
                         </p>
                         <div className="text-xs text-gray-400 font-medium pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center gap-2">
                            <span>{related.authorName}</span>
                            <span>•</span>
                            <span>{related.publishedAt ? new Date(related.publishedAt).toLocaleDateString() : ''}</span>
                         </div>
                      </div>
                   </Link>
                 ))}
              </div>
           </div>
        </div>
      )}
    </PublicLayout>
  );
};

export default ArticleTemplate;