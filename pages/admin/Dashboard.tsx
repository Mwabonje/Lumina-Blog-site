import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, PostStatus } from '../../types';
import { getPosts, deletePost } from '../../services/blogService';
import AdminLayout from '../../components/layout/AdminLayout';
import SEOHead from '../../components/ui/SEOHead';

const Dashboard = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPosts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    if (!silent) setError(null);
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (err: any) {
      console.error(err);
      if (!silent) setError(err.message || 'Failed to connect to Supabase');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();

    // Poll every 10 seconds to check for scheduled posts becoming active
    // The getPosts service handles the logic of checking timestamps and updating DB
    const interval = setInterval(() => {
      loadPosts(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [loadPosts]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
        loadPosts(true); // Silent reload after delete
      } catch (err: any) {
        alert(`Failed to delete: ${err.message}`);
      }
    }
  };

  const StatusBadge = ({ status }: { status: PostStatus }) => {
    const styles = {
      [PostStatus.PUBLISHED]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      [PostStatus.DRAFT]: 'bg-stone-100 text-stone-600 border-stone-200',
      [PostStatus.SCHEDULED]: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.category?.toLowerCase().includes(query) ||
      post.tags?.some(tag => tag.toLowerCase().includes(query)) ||
      post.seo?.keywords?.some(k => k.toLowerCase().includes(query))
    );
  });

  return (
    <AdminLayout>
      <SEOHead title="Dashboard" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Overview</h1>
          <p className="text-stone-500 mt-1">Manage your editorial content.</p>
        </div>
        <Link to="/admin/posts/new" className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium tracking-wide hover:bg-stone-800 transition shadow-md flex items-center gap-2 whitespace-nowrap">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          New Story
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-stone-200 rounded-xl leading-5 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue sm:text-sm shadow-sm transition-all"
            placeholder="Search articles by title, category, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm leading-5 font-medium text-red-800">
                Connection Error
              </h3>
              <div className="mt-2 text-sm leading-5 text-red-700">
                <p>{error}</p>
                <p className="mt-2 text-xs">Tip: Check your API Key and ensure RLS policies allow 'public' access in Supabase.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 font-light flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-stone-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Loading data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="p-4 lg:p-5 font-bold text-xs text-stone-500 uppercase tracking-wider">Title</th>
                  <th className="p-4 lg:p-5 font-bold text-xs text-stone-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 lg:p-5 font-bold text-xs text-stone-500 uppercase tracking-wider">Published/Scheduled</th>
                  <th className="p-4 lg:p-5 font-bold text-xs text-stone-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="p-4 lg:p-5 max-w-md min-w-[200px]">
                      <Link to={`/admin/posts/${post.id}`} className="font-serif font-bold text-primary text-lg hover:text-brand-blue transition-colors block mb-1">
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
                        <span className="truncate max-w-[150px]">/{post.slug}</span>
                        {post.category && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-stone-300 flex-shrink-0"></span>
                            <span className="text-stone-500 font-sans whitespace-nowrap">{post.category}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 lg:p-5 whitespace-nowrap">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="p-4 lg:p-5 text-sm text-stone-500 font-medium whitespace-nowrap">
                      {post.publishedAt ? (
                        post.status === PostStatus.SCHEDULED ? (
                          new Date(post.publishedAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })
                        ) : (
                          new Date(post.publishedAt).toLocaleDateString()
                        )
                      ) : '—'}
                    </td>
                    <td className="p-4 lg:p-5 text-right whitespace-nowrap space-x-2">
                      <Link 
                        to={`/admin/posts/${post.id}`} 
                        className="inline-flex items-center px-3 py-1.5 border border-stone-200 text-xs font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors shadow-sm"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(post.id)} 
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPosts.length === 0 && !error && (
                  <tr>
                    <td colSpan={4} className="p-16 text-center text-stone-400">
                      {searchQuery ? (
                        <div className="flex flex-col items-center">
                           <svg className="w-12 h-12 text-stone-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                           <p className="text-stone-500 font-medium">No results found for "{searchQuery}"</p>
                           <p className="text-sm mt-1">Try adjusting your search terms.</p>
                           <button onClick={() => setSearchQuery('')} className="mt-4 text-brand-blue text-sm hover:underline">Clear search</button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                           <p>No content yet.</p>
                           <Link to="/admin/posts/new" className="mt-2 text-brand-blue hover:underline text-sm">Create your first post</Link>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;