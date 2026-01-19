import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlogPost, ContentBlock, PostStatus, Category, AISuggestion, SEOData } from '../../types';
import { getPostById, savePost, getCategories } from '../../services/blogService';
import { generateSEOSuggestions } from '../../services/geminiService';
import { compressImage } from '../../utils/imageOptimizer';
import AdminLayout from '../../components/layout/AdminLayout';
import SEOHead from '../../components/ui/SEOHead';
import ArticleTemplate from '../../components/blog/ArticleTemplate';

const AUTHOR_TITLES = [
  'Author',
  'SEO Specialist',
  'Social Media Specialist',
  'Content Strategist',
  'Senior Editor',
  'Marketing Director',
  'Data Analyst',
  'Guest Contributor'
];

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id !== 'new';

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAdvancedSEO, setShowAdvancedSEO] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  
  // Focus Management
  const blockRefs = useRef<{ [key: string]: HTMLTextAreaElement | HTMLInputElement | null }>({});
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [authorName, setAuthorName] = useState('Admin User');
  const [authorTitle, setAuthorTitle] = useState('Author');
  const [status, setStatus] = useState<PostStatus>(PostStatus.DRAFT);
  const [categoryId, setCategoryId] = useState('');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [featuredImage, setFeaturedImage] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  
  // Track original state to handle publish date logic correctly
  const [originalStatus, setOriginalStatus] = useState<PostStatus>(PostStatus.DRAFT);
  const [originalPublishedAt, setOriginalPublishedAt] = useState<string | null>(null);
  
  // Detailed SEO State
  const [seo, setSeo] = useState<SEOData>({ 
    metaTitle: '', 
    metaDescription: '', 
    keywords: [],
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: ''
  });
  const [keywordsInput, setKeywordsInput] = useState('');

  useEffect(() => {
    const init = async () => {
      const cats = await getCategories();
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);

      if (isEditMode) {
        setLoading(true);
        const post = await getPostById(id);
        if (post) {
          setTitle(post.title);
          setSlug(post.slug);
          setExcerpt(post.excerpt);
          setAuthorName(post.authorName || 'Admin User');
          setAuthorTitle(post.authorTitle || 'Author');
          setStatus(post.status);
          setOriginalStatus(post.status);
          setOriginalPublishedAt(post.publishedAt);
          setCategoryId(post.category);
          setBlocks(post.blocks);
          setFeaturedImage(post.featuredImage);
          
          if (post.scheduledFor) {
            // Convert to datetime-local format (YYYY-MM-DDTHH:mm)
            setScheduledFor(new Date(post.scheduledFor).toISOString().slice(0, 16));
          }
          
          setSeo({
            metaTitle: post.seo.metaTitle || '',
            metaDescription: post.seo.metaDescription || '',
            keywords: post.seo.keywords || [],
            canonicalUrl: post.seo.canonicalUrl || '',
            ogTitle: post.seo.ogTitle || '',
            ogDescription: post.seo.ogDescription || '',
            ogImage: post.seo.ogImage || ''
          });
          setKeywordsInput(post.seo.keywords.join(', '));
        }
        setLoading(false);
      } else {
        setBlocks([{ id: Date.now().toString(), type: 'paragraph', content: '' }]);
      }
    };
    init();
  }, [id, isEditMode]);

  // Handle auto-focusing new blocks
  useEffect(() => {
    if (focusBlockId && blockRefs.current[focusBlockId]) {
      blockRefs.current[focusBlockId]?.focus();
      setFocusBlockId(null);
    }
  }, [blocks, focusBlockId]);

  const handleAI = async () => {
    const contentText = blocks.map(b => b.content).join(' ');
    if (!contentText) return alert('Please write some content first.');
    
    setAiLoading(true);
    try {
      const suggestion: AISuggestion = await generateSEOSuggestions(contentText);
      
      if (window.confirm('Apply AI suggestions to Title, Excerpt, and SEO fields?')) {
        setTitle(suggestion.title);
        setExcerpt(suggestion.excerpt);
        
        const newKeywords = suggestion.seo.keywords;
        
        setSeo(prev => ({
          ...prev,
          metaTitle: suggestion.seo.metaTitle,
          metaDescription: suggestion.seo.metaDescription,
          keywords: newKeywords,
          ogTitle: suggestion.seo.ogTitle || suggestion.seo.metaTitle,
          ogDescription: suggestion.seo.ogDescription || suggestion.seo.metaDescription,
        }));
        setKeywordsInput(newKeywords.join(', '));
        
        setSlug(suggestion.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
      }
    } catch (e) {
      alert('Failed to generate AI suggestions. Check API Key.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (status === PostStatus.SCHEDULED && !scheduledFor) {
       alert("Please set a date and time for the scheduled post.");
       return;
    }

    setSaving(true);
    try {
      let finalPublishedAt = null;
      
      if (status === PostStatus.PUBLISHED) {
         // If it was already published, keep the original date. 
         // If switching from Draft/Scheduled to Published, use Now.
         if (originalStatus === PostStatus.PUBLISHED && originalPublishedAt) {
            finalPublishedAt = originalPublishedAt;
         } else {
            finalPublishedAt = new Date().toISOString();
         }
      } else if (status === PostStatus.SCHEDULED) {
         // For scheduled posts, we set the publishedAt to the future date
         // so sorting works correctly in lists
         finalPublishedAt = new Date(scheduledFor).toISOString();
      }

      const post: BlogPost = {
        id: isEditMode && id ? id : Date.now().toString(),
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt,
        status,
        category: categoryId,
        featuredImage: featuredImage || 'https://picsum.photos/800/600.webp',
        authorId: 'admin-1',
        authorName: authorName,
        authorTitle: authorTitle,
        publishedAt: finalPublishedAt,
        scheduledFor: status === PostStatus.SCHEDULED ? new Date(scheduledFor).toISOString() : null,
        blocks,
        readingTimeMinutes: 0,
        tags: [],
        seo: {
          ...seo,
          keywords: keywordsInput.split(',').map(k => k.trim()).filter(k => k),
        }
      };

      await savePost(post);
      navigate('/admin/posts');
    } catch (err: any) {
      console.error(err);
      alert(`Error saving post: ${err.message}\n\nPlease check your Database permissions (RLS), API Key, and ensure you have added the 'author_title' column.`);
    } finally {
      setSaving(false);
    }
  };

  // Block Editor Helpers
  
  const handleKeyDown = (e: React.KeyboardEvent, idx: number, type: ContentBlock['type']) => {
    if (e.key === 'Enter') {
      if (type === 'heading') {
        e.preventDefault();
        const newId = Date.now().toString() + Math.random();
        const newBlock: ContentBlock = { 
          id: newId, 
          type: 'paragraph', 
          content: '' 
        };
        
        const newBlocks = [...blocks];
        newBlocks.splice(idx + 1, 0, newBlock);
        setBlocks(newBlocks);
        setFocusBlockId(newId);
      }
    }
  };

  const updateBlock = (idx: number, content: string) => {
    const newBlocks = [...blocks];
    newBlocks[idx].content = content;
    setBlocks(newBlocks);
  };

  const addBlock = (type: ContentBlock['type']) => {
    let content = '';
    if (type === 'list') content = '[]';
    setBlocks([...blocks, { id: Date.now().toString(), type, content, metadata: { level: 2 } }]);
  };

  const removeBlock = (idx: number) => {
    const newBlocks = [...blocks];
    newBlocks.splice(idx, 1);
    setBlocks(newBlocks);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessingImage(true);
    try {
      const optimizedDataUrl = await compressImage(file);
      const altText = window.prompt("Enter alternative text for this image (for SEO and accessibility):", "");

      const newBlocks = [...blocks];
      newBlocks[idx].content = optimizedDataUrl;
      newBlocks[idx].metadata = { 
        ...newBlocks[idx].metadata, 
        alt: altText || '' 
      };
      setBlocks(newBlocks);
    } catch (err) {
      console.error("Image processing failed", err);
      alert("Failed to process image.");
    } finally {
      setProcessingImage(false);
    }
  };
  
  const handleHeadingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessingImage(true);
    try {
      const optimizedDataUrl = await compressImage(file);
      const newBlocks = [...blocks];
      newBlocks[idx].metadata = { ...newBlocks[idx].metadata, image: optimizedDataUrl };
      setBlocks(newBlocks);
    } catch (err) {
      console.error("Image processing failed", err);
      alert("Failed to process image.");
    } finally {
      setProcessingImage(false);
    }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessingImage(true);
    try {
      const optimizedDataUrl = await compressImage(file);
      setFeaturedImage(optimizedDataUrl);
    } catch (err) {
      console.error("Image processing failed", err);
      alert("Failed to process image.");
    } finally {
      setProcessingImage(false);
    }
  };

  const removeHeadingImage = (idx: number) => {
    const newBlocks = [...blocks];
    if (newBlocks[idx].metadata) {
       const { image, ...rest } = newBlocks[idx].metadata!;
       newBlocks[idx].metadata = rest;
       setBlocks(newBlocks);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, idx: number) => {
    const clipboardText = e.clipboardData.getData('text');
    e.preventDefault();

    const target = e.target as HTMLTextAreaElement;
    const selectionStart = target.selectionStart;
    const currentContent = blocks[idx].content;

    const textBefore = currentContent.slice(0, selectionStart);
    const textAfter = currentContent.slice(target.selectionEnd);

    const lines = clipboardText.split(/\r?\n/);
    const parsedBlocks: ContentBlock[] = [];
    
    let bufferType: 'paragraph' | 'list' | null = null;
    let bufferContent: string[] = []; 

    const flush = () => {
       if (!bufferType) return;
       
       if (bufferType === 'list') {
          if (bufferContent.length > 0) {
            parsedBlocks.push({
               id: Date.now().toString() + Math.random(),
               type: 'list',
               content: JSON.stringify(bufferContent)
            });
          }
       } else {
          const text = bufferContent.join(' ').trim();
          if (text) {
              parsedBlocks.push({
                 id: Date.now().toString() + Math.random(),
                 type: 'paragraph',
                 content: text
              });
          }
       }
       bufferType = null;
       bufferContent = [];
    };

    lines.forEach(line => {
       const trimmed = line.trim();
       if (!trimmed) {
          flush();
          return;
       }

       if (/^#{1,6}\s/.test(trimmed)) {
          flush();
          const level = (trimmed.match(/^#{1,6}/)?.[0].length || 2) as 1|2|3|4|5|6;
          parsedBlocks.push({
             id: Date.now().toString() + Math.random(),
             type: 'heading',
             content: trimmed.replace(/^#{1,6}\s+/, ''),
             metadata: { level }
          });
          return;
       }
       
       if (/^[\*\-]\s/.test(trimmed)) {
          if (bufferType !== 'list') flush();
          bufferType = 'list';
          bufferContent.push(trimmed.replace(/^[\*\-]\s+/, ''));
          return;
       }

       if (bufferType === null) {
          bufferType = 'paragraph';
          bufferContent.push(trimmed);
       } else if (bufferType === 'list') {
          flush();
          bufferType = 'paragraph';
          bufferContent.push(trimmed);
       } else {
          bufferContent.push(trimmed);
       }
    });
    flush();

    if (parsedBlocks.length === 0) return;

    const updatedBlocks = [...blocks];
    updatedBlocks[idx] = { ...updatedBlocks[idx], content: textBefore };
    updatedBlocks.splice(idx + 1, 0, ...parsedBlocks);

    if (textAfter.trim()) {
      updatedBlocks.splice(idx + 1 + parsedBlocks.length, 0, {
        id: Date.now().toString() + Math.random(),
        type: 'paragraph',
        content: textAfter
      });
    }

    if (!textBefore.trim()) {
       updatedBlocks.splice(idx, 1);
    }

    setBlocks(updatedBlocks);
  };

  if (loading) return <AdminLayout><div className="p-8">Loading editor...</div></AdminLayout>;

  // RENDER PREVIEW MODE
  if (showPreview) {
    const textContent = blocks.map(b => b.content).join(' ');
    const wordCount = textContent.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const previewPost: BlogPost = {
      id: 'preview',
      title: title || 'Untitled Post',
      slug: slug || 'preview-slug',
      excerpt: excerpt,
      status: PostStatus.DRAFT,
      category: categoryId,
      featuredImage: featuredImage,
      authorId: 'admin-1',
      authorName: authorName,
      authorTitle: authorTitle,
      publishedAt: status === PostStatus.PUBLISHED ? new Date().toISOString() : null,
      blocks: blocks,
      readingTimeMinutes: readingTime,
      tags: keywordsInput.split(',').filter(k => k.trim()),
      seo: seo
    };

    return (
      <div className="bg-white min-h-screen relative z-50">
         <ArticleTemplate post={previewPost} previewMode={true} />
         <div className="fixed bottom-8 right-8 z-[100] flex gap-4 animate-bounce-in">
            <button 
              onClick={() => setShowPreview(false)}
              className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-2 border border-slate-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path></svg>
              Back to Editor
            </button>
         </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <SEOHead title={isEditMode ? 'Edit Post' : 'New Post'} noIndex={true} />
      
      <div className="max-w-5xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            {isEditMode ? 'Edit Post' : 'New Post'}
          </h1>
          <div className="flex gap-3">
             <button 
              onClick={handleAI}
              disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 shadow-sm"
            >
              {aiLoading ? 'Thinking...' : '✨ AI Assist'}
            </button>
            <button 
              onClick={() => setShowPreview(true)}
              className="px-6 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm font-medium"
            >
              Preview
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {saving ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </div>

        {processingImage && (
          <div className="fixed inset-0 bg-black/20 z-[200] flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span className="text-sm font-medium">Optimizing image...</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <input
                type="text"
                placeholder="Post Title"
                className="w-full text-4xl font-bold font-serif placeholder-slate-300 border-none outline-none mb-4"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <textarea
                placeholder="Short excerpt..."
                className="w-full text-lg text-slate-600 placeholder-slate-300 border-none outline-none resize-none"
                rows={2}
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
              />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
              <div className="space-y-4">
                {blocks.map((block, idx) => (
                  <div key={block.id} className="group relative">
                    <div className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
                      <button onClick={() => removeBlock(idx)} className="p-1 text-red-400 hover:text-red-600">✕</button>
                    </div>
                    
                    {block.type === 'heading' && (
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                           <input
                            ref={el => { blockRefs.current[block.id] = el; }}
                            type="text"
                            value={block.content}
                            onChange={e => updateBlock(idx, e.target.value)}
                            onKeyDown={e => handleKeyDown(e, idx, 'heading')}
                            placeholder="Heading..."
                            className="w-full text-2xl font-bold text-slate-800 border-none outline-none"
                           />
                           {!block.metadata?.image && (
                             <label className="cursor-pointer text-slate-300 hover:text-brand-blue transition-colors p-1" title="Add Cover Image">
                               <input 
                                 type="file" 
                                 accept="image/*" 
                                 className="hidden" 
                                 onChange={(e) => handleHeadingImageUpload(e, idx)} 
                               />
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                             </label>
                           )}
                        </div>
                        {block.metadata?.image && (
                          <div className="relative mb-3 group/cover">
                             <img src={block.metadata.image} alt="Heading Cover" className="w-full h-40 object-cover rounded-lg shadow-sm" />
                             <button 
                               onClick={() => removeHeadingImage(idx)}
                               className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full shadow-sm opacity-0 group-hover/cover:opacity-100 transition-opacity hover:bg-white"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                             </button>
                          </div>
                        )}
                      </div>
                    )}
                    {block.type === 'paragraph' && (
                      <textarea
                        ref={el => { blockRefs.current[block.id] = el; }}
                        value={block.content}
                        onChange={e => updateBlock(idx, e.target.value)}
                        onPaste={e => handlePaste(e, idx)}
                        placeholder="Type something amazing..."
                        className="w-full text-base leading-relaxed text-slate-700 border-none outline-none resize-none bg-transparent"
                        rows={Math.max(2, Math.ceil(block.content.length / 80))}
                      />
                    )}
                    {block.type === 'list' && (
                      <div className="space-y-2 bg-slate-50 p-4 rounded-lg">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bullet List</label>
                        {(() => {
                           let items: string[] = [];
                           try { items = block.content ? JSON.parse(block.content) : []; } catch(e) { items = []; }
                           return (
                             <div className="space-y-2">
                               {items.map((item, i) => (
                                 <div key={i} className="flex gap-2 items-start">
                                   <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
                                   <input
                                     value={item}
                                     onChange={(e) => {
                                        const newItems = [...items];
                                        newItems[i] = e.target.value;
                                        updateBlock(idx, JSON.stringify(newItems));
                                     }}
                                     className="flex-1 p-2 bg-white border border-slate-200 rounded text-sm text-slate-700 focus:border-brand-blue outline-none font-mono"
                                     placeholder="List item..."
                                   />
                                   <button onClick={() => {
                                      const newItems = items.filter((_, index) => index !== i);
                                      updateBlock(idx, JSON.stringify(newItems));
                                   }} className="mt-2 text-slate-300 hover:text-red-400">
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                   </button>
                                 </div>
                               ))}
                               <button 
                                 onClick={() => {
                                   items.push('');
                                   updateBlock(idx, JSON.stringify(items));
                                 }} 
                                 className="text-xs text-brand-blue font-bold hover:underline flex items-center gap-1 mt-2"
                               >
                                 + Add Item
                               </button>
                             </div>
                           );
                        })()}
                      </div>
                    )}
                    {block.type === 'image' && (
                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 bg-slate-50 text-center relative hover:border-brand-blue transition-colors">
                        {block.content ? (
                          <div className="relative group/image">
                             <img src={block.content} alt={block.metadata?.alt || "Preview"} className="max-h-96 mx-auto rounded shadow-sm" />
                             <button 
                              onClick={() => updateBlock(idx, '')} 
                              className="absolute top-2 right-2 bg-white text-red-500 p-2 rounded-full shadow-md opacity-0 group-hover/image:opacity-100 transition-opacity"
                              title="Remove Image"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                             </button>
                             
                             {/* Alt Text Editor */}
                             <div className="mt-4 text-left max-w-lg mx-auto bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Alt Text (Description)</label>
                               <input 
                                 type="text" 
                                 value={block.metadata?.alt || ''} 
                                 onChange={(e) => {
                                    const newBlocks = [...blocks];
                                    newBlocks[idx].metadata = { ...newBlocks[idx].metadata, alt: e.target.value };
                                    setBlocks(newBlocks);
                                 }}
                                 className="block w-full text-sm p-2 border border-slate-200 rounded text-slate-700 outline-none focus:border-brand-blue transition-colors"
                                 placeholder="Describe this image for SEO and accessibility..."
                               />
                             </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                             <div className="flex flex-col items-center justify-center py-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                                <p className="text-sm text-slate-500 font-medium mb-1">Click to Upload Image</p>
                                <p className="text-xs text-slate-400 mb-4">Optimized to WebP automatically</p>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, idx)} 
                                  className="block w-full max-w-xs text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-sky-600 cursor-pointer mx-auto"
                                />
                             </div>
                             
                             <div className="relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 px-2 text-slate-400 font-bold tracking-wider">Or paste URL</span></div>
                             </div>
                             
                             <input 
                              type="text" 
                              placeholder="https://example.com/image.jpg"
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-brand-blue"
                              value={block.content}
                              onChange={e => updateBlock(idx, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {block.type === 'code' && (
                      <textarea
                        ref={el => { blockRefs.current[block.id] = el; }}
                        value={block.content}
                        onChange={e => updateBlock(idx, e.target.value)}
                        placeholder="Paste code here..."
                        className="w-full font-mono text-sm bg-slate-900 text-slate-200 p-4 rounded-lg outline-none"
                        rows={5}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Block Controls */}
              <div className="mt-8 flex gap-2 border-t border-slate-100 pt-4 flex-wrap">
                <button onClick={() => addBlock('paragraph')} className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition">+ Text</button>
                <button onClick={() => addBlock('heading')} className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition">+ Heading</button>
                <button onClick={() => addBlock('list')} className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition">+ List</button>
                <button onClick={() => addBlock('image')} className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition">+ Image</button>
                <button onClick={() => addBlock('code')} className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition">+ Code</button>
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 mb-4 uppercase tracking-wider">Publishing</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value as PostStatus)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                  >
                    <option value={PostStatus.DRAFT}>Draft</option>
                    <option value={PostStatus.PUBLISHED}>Published</option>
                    <option value={PostStatus.SCHEDULED}>Scheduled</option>
                  </select>
                </div>

                {status === PostStatus.SCHEDULED && (
                   <div className="animate-in fade-in slide-in-from-top-2">
                     <label className="block text-xs font-medium text-slate-500 mb-1">Schedule Date</label>
                     <input 
                       type="datetime-local" 
                       value={scheduledFor}
                       onChange={e => setScheduledFor(e.target.value)}
                       className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:border-brand-blue"
                       required
                     />
                   </div>
                )}
                
                <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Author Name</label>
                      <input 
                        type="text" 
                        value={authorName}
                        onChange={e => setAuthorName(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="E.g. John Doe"
                      />
                    </div>
                     <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Author Title</label>
                      <select 
                        value={authorTitle}
                        onChange={e => setAuthorTitle(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                      >
                         {AUTHOR_TITLES.map(title => (
                           <option key={title} value={title}>{title}</option>
                         ))}
                      </select>
                    </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                  <select 
                    value={categoryId} 
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">URL Slug</label>
                  <input 
                    type="text" 
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">SEO Metadata</h3>
                <button onClick={() => setShowAdvancedSEO(!showAdvancedSEO)} className="text-xs text-brand-blue hover:underline">
                  {showAdvancedSEO ? 'Hide Advanced' : 'Show Advanced'}
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Meta Title</label>
                  <input 
                    type="text" 
                    value={seo.metaTitle}
                    onChange={e => setSeo({...seo, metaTitle: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    maxLength={60}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Meta Description</label>
                  <textarea 
                    value={seo.metaDescription}
                    onChange={e => setSeo({...seo, metaDescription: e.target.value})}
                    rows={3}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    maxLength={160}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Keywords (comma sep)</label>
                  <input 
                    type="text" 
                    value={keywordsInput}
                    onChange={e => setKeywordsInput(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                
                {showAdvancedSEO && (
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Canonical URL</label>
                      <input 
                        type="text" 
                        value={seo.canonicalUrl}
                        onChange={e => setSeo({...seo, canonicalUrl: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Open Graph Title</label>
                      <input 
                        type="text" 
                        value={seo.ogTitle}
                        onChange={e => setSeo({...seo, ogTitle: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Open Graph Description</label>
                      <textarea 
                        value={seo.ogDescription}
                        onChange={e => setSeo({...seo, ogDescription: e.target.value})}
                        rows={2}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Open Graph Image URL</label>
                      <input 
                        type="text" 
                        value={seo.ogImage}
                        onChange={e => setSeo({...seo, ogImage: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
             <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 mb-4 uppercase tracking-wider">Featured Image</h3>
              
              <div className="mb-3">
                 <input 
                   type="text" 
                   value={featuredImage}
                   onChange={e => setFeaturedImage(e.target.value)}
                   placeholder="Image URL"
                   className="w-full p-2 border border-slate-200 rounded-lg text-sm mb-2"
                 />
                 <div className="flex items-center gap-2">
                   <div className="h-px bg-slate-200 flex-grow"></div>
                   <span className="text-xs text-slate-400 uppercase">OR UPLOAD</span>
                   <div className="h-px bg-slate-200 flex-grow"></div>
                 </div>
                 <label className="block mt-2 cursor-pointer border border-dashed border-slate-300 rounded-lg p-2 text-center hover:bg-slate-50 hover:border-brand-blue transition-colors">
                    <span className="text-xs text-slate-500 font-medium">Click to upload (Auto-WebP)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFeaturedImageUpload}
                    />
                 </label>
              </div>

              {featuredImage && (
                <div className="relative group/featured">
                  <img src={featuredImage} alt="Featured" className="w-full h-32 object-cover rounded-lg" />
                   <button 
                      onClick={() => setFeaturedImage('')} 
                      className="absolute top-2 right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md opacity-0 group-hover/featured:opacity-100 transition-opacity"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                   </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PostEditor;