import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, PostStatus } from '../../types';
import { getPosts, deletePost } from '../../services/blogService';
import AdminLayout from '../../components/layout/AdminLayout';
import SEOHead from '../../components/ui/SEOHead';

const Dashboard = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const data = await getPosts();
    setPosts(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost(id);
      loadPosts();
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

  return (
    <AdminLayout>
      <SEOHead title="Dashboard" />
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Overview</h1>
          <p className="text-stone-500 mt-1">Manage your editorial content.</p>
        </div>
        <Link to="/admin/posts/new" className="bg-primary text-white px-6 py-2.5 rounded-sm text-sm font-medium tracking-wide hover:bg-stone-800 transition shadow-md">
          + New Story
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 font-light">Loading data...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="p-5 font-bold text-xs text-stone-500 uppercase tracking-wider">Title</th>
                <th className="p-5 font-bold text-xs text-stone-500 uppercase tracking-wider">Status</th>
                <th className="p-5 font-bold text-xs text-stone-500 uppercase tracking-wider">Published</th>
                <th className="p-5 font-bold text-xs text-stone-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="p-5">
                    <Link to={`/admin/posts/${post.id}`} className="font-serif font-bold text-primary text-lg hover:text-accent transition-colors">
                      {post.title}
                    </Link>
                    <div className="text-xs text-stone-400 mt-1 font-mono">{post.slug}</div>
                  </td>
                  <td className="p-5">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="p-5 text-sm text-stone-500 font-medium">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-5 text-right space-x-4">
                    <Link to={`/admin/posts/${post.id}`} className="text-sm font-medium text-stone-500 hover:text-primary transition-colors">Edit</Link>
                    <button onClick={() => handleDelete(post.id)} className="text-sm font-medium text-red-400 hover:text-red-600 transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-stone-400">No content yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;