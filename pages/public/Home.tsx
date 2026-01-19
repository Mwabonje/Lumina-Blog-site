import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, PostStatus } from '../../types';
import { getPosts } from '../../services/blogService';
import PublicLayout from '../../components/layout/PublicLayout';
import SEOHead from '../../components/ui/SEOHead';

const Home = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  
  useEffect(() => {
    getPosts(PostStatus.PUBLISHED).then(setPosts);
  }, []);

  // Dynamically select the newest post as featured, instead of relying on a hardcoded ID
  const featured = posts.length > 0 ? posts[0] : undefined;
  const gridPosts = posts.length > 0 ? posts.slice(1) : [];

  return (
    <PublicLayout>
      <SEOHead 
        title="Lumina Insights" 
        description="Explore Our Latest Articles and Industry Insights"
      />

      {/* Page Header Banner */}
      <div className="bg-[#020617] py-20 relative overflow-hidden">
        {/* Background Image Overlay */}
         <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent"></div>
         
         <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
           <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Lumina Insights</h1>
           <p className="text-gray-400 text-lg">Explore Our Latest Articles and Industry Insights</p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 -mt-8 relative z-20">
        
        {/* Featured Section (Card with Image Left, Content Right) */}
        {featured && (
          <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-xl shadow-blue-900/5 mb-16 flex flex-col md:flex-row gap-8 md:gap-12 items-center border border-white/50 dark:border-slate-800">
             <div className="w-full md:w-1/2">
                <div className="rounded-2xl overflow-hidden h-[300px] md:h-[350px] shadow-lg">
                   <img 
                    src={featured.featuredImage} 
                    alt={featured.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                   />
                </div>
             </div>
             <div className="w-full md:w-1/2 flex flex-col items-start">
                <div className="flex gap-3 mb-4 text-sm font-medium">
                   <span className="text-secondary">{featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : ''}</span>
                   <span className="bg-blue-50 dark:bg-blue-900/20 text-brand-blue px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">{featured.category}</span>
                </div>
                <Link to={`/blog/${featured.slug}`}>
                  <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 leading-tight hover:text-brand-blue transition-colors">
                    {featured.title}
                  </h2>
                </Link>
                <p className="text-secondary text-base leading-relaxed mb-8 line-clamp-3">
                  {featured.excerpt}
                </p>
                
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-700">
                     <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(featured.authorName)}&background=0ea5e9&color=fff`} alt={featured.authorName} className="w-full h-full object-cover" />
                   </div>
                   <div>
                     <div className="text-sm font-bold text-primary">{featured.authorName}</div>
                     <div className="text-xs text-secondary">{featured.authorTitle || 'Author'}</div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Grid Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gridPosts.map(post => {
            // Determine badge color style based on category
            let badgeClass = "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
            if (post.category === 'Content') badgeClass = "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
            if (post.category === 'Strategy') badgeClass = "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";

            return (
              <article key={post.id} className="bg-surface rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-slate-100 dark:border-slate-800 group">
                <Link to={`/blog/${post.slug}`} className="block overflow-hidden rounded-xl mb-6 h-52 relative">
                   <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4 text-xs font-medium">
                     <span className="text-secondary">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : ''}</span>
                     <span className={`px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold ${badgeClass}`}>
                       {post.category}
                     </span>
                  </div>
                  
                  <Link to={`/blog/${post.slug}`} className="block mb-3">
                    <h3 className="text-xl font-bold text-primary leading-snug hover:text-brand-blue transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  
                  <p className="text-secondary text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700">
                       <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=random`} alt={post.authorName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-primary">{post.authorName}</div>
                      <div className="text-xs text-secondary">{post.authorTitle || 'Author'}</div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {posts.length === 0 && (
           <div className="text-center py-20">
              <div className="inline-block p-4 rounded-full bg-surface mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <h3 className="text-lg font-medium text-primary">No stories published yet</h3>
              <p className="text-secondary mt-1">Check back soon for new insights.</p>
           </div>
        )}
        
      </div>
    </PublicLayout>
  );
};

export default Home;