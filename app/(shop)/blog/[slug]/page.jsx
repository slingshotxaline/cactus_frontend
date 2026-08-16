"use client";

import { useGetBlogPostBySlugQuery } from "../../../../features/blog/blogApi";

export default function BlogPostPage({ params }) {
  const { data, isLoading } = useGetBlogPostBySlugQuery(params.slug);
  const post = data?.data;

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-16">Loading...</div>;
  if (!post) return <div className="max-w-3xl mx-auto px-4 py-16">Post not found.</div>;

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      {post.coverImage?.url && (
        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
          <img src={post.coverImage.url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
      <p className="text-sm text-gray-400 mt-2">
        {post.author?.name} · {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
      </p>
      {/* Content is trusted rich text from CMS staff (blog.controller.js gates writes to
          admin/marketing roles) — sanitize server-side before saving if you open this up. */}
      <div className="prose mt-8 text-gray-700" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
