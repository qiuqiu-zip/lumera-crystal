"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createAdminCategory, getAdminCategory, updateAdminCategory } from "@/lib/admin-api";
import { ImageUploadField } from "@/components/admin/image-upload-field";

export function CategoryForm({ categoryId }: { categoryId?: number }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    cover_image: "",
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;
    getAdminCategory(categoryId).then((item) => {
      setForm({
        name: item.name,
        slug: item.slug,
        description: item.description,
        cover_image: item.cover_image,
        sort_order: item.sort_order,
      });
    });
  }, [categoryId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (!form.cover_image.trim()) {
        throw new Error("请上传分类图片");
      }
      if (categoryId) {
        await updateAdminCategory(categoryId, form);
      } else {
        await createAdminCategory(form);
      }
      setMessage("保存成功");
      setTimeout(() => router.push("/admin/categories"), 500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 pb-24 sm:p-5">
      <label className="block space-y-1 text-sm">
        <span className="text-stone-600">名称</span>
        <input className="h-11 w-full rounded-lg border border-stone-300 px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-stone-600">Slug</span>
        <input className="h-11 w-full rounded-lg border border-stone-300 px-3 py-2" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-stone-600">描述</span>
        <textarea className="min-h-24 w-full rounded-lg border border-stone-300 px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <ImageUploadField
        label="分类图片"
        value={form.cover_image}
        required
        onChange={(nextUrl) => setForm({ ...form, cover_image: nextUrl })}
        hint="上传后将自动写入分类图片地址。"
      />
      <label className="block space-y-1 text-sm">
        <span className="text-stone-600">排序</span>
        <input type="number" className="h-11 w-full rounded-lg border border-stone-300 px-3 py-2" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
      </label>
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-stone-200 bg-white/95 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2 sm:static sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0">
        <div className="flex items-center gap-2 sm:gap-3">
        {message ? <span className="text-sm text-stone-600">{message}</span> : null}
        <button type="button" className="min-h-11 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm sm:flex-none" onClick={() => router.push("/admin/categories")}>
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
