import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BlogPost } from '../../types';
import { getPostBySlug, getRelatedPosts } from '../../services/blogService';
import ArticleTemplate from '../../components/blog/ArticleTemplate';

const PostView = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      setPost(undefined);
      setError(false);
      
      getPostBySlug(slug)
        .then(async (fetchedPost) => {
          setPost(fetchedPost || null);
          if (fetchedPost) {
            // Fetch related posts based on category
            const related = await getRelatedPosts(fetchedPost.id, fetchedPost.category).catch(() => []);
            setRelatedPosts(related);
          }
        })
        .catch(err => {
          console.error("Failed to fetch post:", err);
          setError(true);
        });
    }
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
         <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-2">Something went wrong</h2>
            <p className="text-secondary">We couldn't load this article. Please try again later.</p>
         </div>
      </div>
    );
  }

  if (post === undefined) return <div className="p-40 text-center text-secondary">Loading Article...</div>;
  if (post === null) return <div className="p-40 text-center text-secondary">Article not found</div>;

  return <ArticleTemplate post={post} relatedPosts={relatedPosts} />;
};

export default PostView;