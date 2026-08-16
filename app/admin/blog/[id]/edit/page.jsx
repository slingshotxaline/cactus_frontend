"use client";

import { useListAllBlogPostsQuery } from "../../../../../features/blog/blogApi";
import BlogPostForm from "../../../../../components/admin/BlogPostForm";

export default function EditBlogPostPage({ params }) {
  const { data, isLoading } = useListAllBlogPostsQuery();
  const post = data?.data?.find((p) => p._id === params.id);

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (!post) return <p className="text-gray-500">Post not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Blog Post</h1>
      <BlogPostForm initialPost={post} />
    </div>
  );
}
