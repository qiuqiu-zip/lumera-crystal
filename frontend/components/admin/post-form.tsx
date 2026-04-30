"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createAdminPost, getAdminPost, updateAdminPost } from "@/lib/admin-api";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { AdminPostStatus } from "@/types/admin";

type PostFormState = {
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  content: string;
  author: string;
  published_at: string;
  tags: string;
  seo_title: string;
  seo_description: string;
  status: AdminPostStatus;
};

export function PostForm({ postId }: { postId?: number }) {
  const router = useRouter();
  const [form, setForm] = useState<PostFormState>({
    title: "",
    slug: "",
    excerpt: "",
    cover_image: "",
    content: "",
    author: "LUMERA 编辑部",
    published_at: "",
    tags: "",
    seo_title: "",
    seo_description: "",
    status: "draft",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    getAdminPost(postId).then((item) => {
      setForm({
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        cover_image: item.cover_image,
        content: item.content,
        author: item.author,
        published_at: item.published_at ? item.published_at.slice(0, 16) : "",
        tags: item.tags.join(","),
        seo_title: item.seo_title,
        seo_description: item.seo_description,
        status: item.status,
      });
    });
  }, [postId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (!form.cover_image.trim()) {
        throw new Error("请上传封面图");
      }
      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        published_at: form.published_at ? new Date(form.published_at).toISOString() : undefined,
      };
      if (postId) {
        await updateAdminPost(postId, payload);
      } else {
        await createAdminPost(payload);
      }
      setMessage("保存成功");
      setTimeout(() => router.push("/admin/posts"), 500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 pb-24 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-stone-600">标题</span>
          <input className="h-11 w-full rounded-lg border border-stone-300 px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-stone-600">Slug</span>
          <input className="h-11 w-full rounded-lg border border-stone-300 px-3 py-2" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        </label>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="text-stone-600">摘要</span>
        <textarea className="min-h-16 w-full rounded-lg border border-stone-300 px-3 py-2" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
      </label>
      <ImageUploadField
        label="封面图"
        value={form.cover_image}
        required
        onChange={(nextUrl) => setForm({ ...form, cover_image: nextUrl })}
        hint="支持 JPG / PNG / WEBP / GIF，上传后自动保存。"
      />
      <label className="block space-y-1 text-sm">
        <span className="text-stone-600">正文（后续可替换富文本）</span>
        <textarea className="min-h-72 w-full rounded-lg border border-stone-300 px-3 py-2" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      </label>
      <div className="grid gap-4 lg:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="text-stone-600">作者</span>
          <input className="w-full rounded-lg border border-stone-300 px-3 py-2" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-stone-600">发布时间</span>
          <input type="datetime-local" className="w-full rounded-lg border border-stone-300 px-3 py-2" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-stone-600">状态</span>
          <select
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as AdminPostStatus })}
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </label>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="text-stone-600">标签（逗号分隔）</span>
        <input className="w-full rounded-lg border border-stone-300 px-3 py-2" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
      </label>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-stone-600">SEO 标题</span>
          <input className="w-full rounded-lg border border-stone-300 px-3 py-2" value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-stone-600">SEO 描述</span>
          <input className="w-full rounded-lg border border-stone-300 px-3 py-2" value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} />
        </label>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-stone-200 bg-white/95 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2 sm:static sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0">
        <div className="flex items-center gap-2 sm:gap-3">
        {message ? <span className="text-sm text-stone-600">{message}</span> : null}
        <button type="button" onClick={() => router.push("/admin/posts")} className="min-h-11 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm sm:flex-none">
          取消
        </button>
        <button type="submit" disabled={saving} className="min-h-11 flex-1 rounded-lg bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-60 sm:flex-none">
          {saving ? "保存中..." : "保存"}
        </button>
        </div>
      </div>
    </form>
  );
}
