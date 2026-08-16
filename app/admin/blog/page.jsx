"use client";

import Link from "next/link";
import { useListAllBlogPostsQuery, useDeleteBlogPostMutation } from "../../../features/blog/blogApi";

export default function AdminBlogListPage() {
  const { data, isLoading } = useListAllBlogPostsQuery();
  const [deletePost] = useDeleteBlogPostMutation();
  const posts = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Link href="/admin/blog/new" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + New Post
        </Link>
      </div>
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Author</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Views</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p._id} className="border-b border-gray-50">
                <td className="py-3 pr-4 font-medium">{p.title}</td>
                <td className="py-3 pr-4">{p.author?.name}</td>
                <td className="py-3 pr-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.isPublished ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="py-3 pr-4">{p.views}</td>
                <td className="py-3 pr-4 space-x-3">
                  <Link href={`/admin/blog/${p._id}/edit`} className="text-brand-500 hover:underline">Edit</Link>
                  <button onClick={() => confirm("Delete this post?") && deletePost(p._id)} className="text-red-500 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-gray-400">No posts yet.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
