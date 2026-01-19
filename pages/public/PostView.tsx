import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BlogPost } from '../../types';
import { getPostBySlug } from '../../services/blogService';
import ArticleTemplate from '../../components/blog/ArticleTemplate';

const PostView = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);

  useEffect(() => {
    if (slug) {
      getPostBySlug(slug).then(setPost);
    }
  }, [slug]);

  if (post === undefined) return <div className="p-40 text-center text-secondary">Loading Article...</div>;
  if (post === null) return <div className="p-40 text-center text-secondary">Article not found</div>;

  return <ArticleTemplate post={post} />;
};

export default PostView;