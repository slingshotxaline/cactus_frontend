"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBlogPostMutation, useUpdateBlogPostMutation } from "../../features/blog/blogApi";
import RichTextEditor from "./RichTextEditor";
import ImageUploader from "./ImageUploader";

const toSlug = (title) => title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function BlogPostForm({ initialPost }) {
  const router = useRouter();
  const isEditing = !!initialPost;
  const [createPost, { isLoading: isCreating }] = useCreateBlogPostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdateBlogPostMutation();

  const [form, setForm] = useState({
    title: initialPost?.title || "",
    slug: initialPost?.slug || "",
    excerpt: initialPost?.excerpt || "",
    content: initialPost?.content || "",
    coverImage: initialPost?.coverImage || null,
    isPublished: initialPost?.isPublished || false,
    tags: (initialPost?.tags || []).join(", "),
  });
  const [error, setError] = useState("");

  const handleTitleChange = (title) =>
    setForm((f) => ({ ...f, title, slug: isEditing ? f.slug : toSlug(title) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      if (isEditing) await updatePost({ id: initialPost._id, ...payload }).unwrap();
      else await createPost(payload).unwrap();
      router.push("/admin/blog");
    } catch (err) {
      setError(err?.data?.message || "Could not save post.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <input
          required
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Slug</label>
        <input
          required
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Excerpt</label>
        <input
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Tags (comma-separated)</label>
        <input
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-2">Cover Image</label>
        {form.coverImage?.url ? (
          <img src={form.coverImage.url} alt="" className="w-48 h-32 object-cover rounded-lg border mb-2" />
        ) : (
          <ImageUploader onUploaded={(img) => setForm({ ...form, coverImage: img })} folder="blog" />
        )}
      </div>

      <div>
        <label className="text-sm font-medium block mb-2">Content</label>
        <RichTextEditor value={form.content} onChange={(content) => setForm({ ...form, content })} />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={form.isPublished}
          onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
        />
        Publish this post
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isCreating || isUpdating}
        className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
      >
        {isCreating || isUpdating ? "Saving..." : isEditing ? "Save Changes" : "Create Post"}
      </button>
    </form>
  );
}
