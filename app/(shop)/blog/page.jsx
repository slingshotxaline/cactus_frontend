"use client";

import Link from "next/link";
import { useGetBlogPostsQuery } from "../../../features/blog/blogApi";

export default function BlogListPage() {
  const { data, isLoading } = useGetBlogPostsQuery({ limit: 12 });
  const posts = data?.data || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Blog</h1>
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link key={post._id} href={`/blog/${post.slug}`} className="block group">
              {post.coverImage?.url && (
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-3">
                  <img
                    src={post.coverImage.url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <h2 className="font-semibold text-gray-900 group-hover:text-brand-500">{post.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{post.excerpt}</p>
              <p className="text-xs text-gray-400 mt-2">
                {post.author?.name} · {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
          {posts.length === 0 && <p className="text-gray-500">No posts yet.</p>}
        </div>
      )}
    </div>
  );
}
