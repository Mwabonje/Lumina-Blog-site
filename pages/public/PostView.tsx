import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BlogPost } from '../../types';
import { getPostBySlug, getRelatedPosts } from '../../services/blogService';
import ArticleTemplate from '../../components/blog/ArticleTemplate';

const PostView = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (slug) {
      setPost(undefined); // Reset state when slug changes
      getPostBySlug(slug).then(async (fetchedPost) => {
        setPost(fetchedPost);
        if (fetchedPost) {
          // Fetch related posts based on category
          const related = await getRelatedPosts(fetchedPost.id, fetchedPost.category);
          setRelatedPosts(related);
        }
      });
    }
  }, [slug]);

  if (post === undefined) return <div className="p-40 text-center text-secondary">Loading Article...</div>;
  if (post === null) return <div className="p-40 text-center text-secondary">Article not found</div>;

  return <ArticleTemplate post={post} relatedPosts={relatedPosts} />;
};

export default PostView;