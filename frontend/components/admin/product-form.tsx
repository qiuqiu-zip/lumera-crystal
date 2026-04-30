"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AdminApiError,
  createAdminProduct,
  getAdminCategories,
  getAdminProduct,
  updateAdminProduct,
} from "@/lib/admin-api";
import { ImageUploadField, ImageUploadListField } from "@/components/admin/image-upload-field";
import type { AdminCategory, AdminProduct } from "@/types/admin";

type ProductFormData = {
  name: string;
  slug: string;
  subtitle: string;
  short_description: string;
  full_description: string;
  price: string;
  stock: number;
  category_id: number;
  cover_media_id?: number;
  gallery_media_ids: number[];
  cover_image: string;
  gallery_images: string;
  crystal_type: string;
  color: string;
  origin: string;
  size: string;
  material: string;
  chakra: string;
  intention: string;
  is_featured: boolean;
  is_new: boolean;
  status: "draft" | "active" | "archived";
};

const initialForm: ProductFormData = {
  name: "",
  slug: "",
  subtitle: "",
  short_description: "",
  full_description: "",
  price: "0",
  stock: 0,
  category_id: 0,
  cover_image: "",
  cover_media_id: undefined,
  gallery_images: "",
  gallery_media_ids: [],
  crystal_type: "",
  color: "",
  origin: "",
  size: "",
  material: "",
  chakra: "",
  intention: "",
  is_featured: false,
  is_new: false,
  status: "active",
};

export function ProductForm({ productId }: { productId?: number }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(initialForm);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [galleryItems, setGalleryItems] = useState<Array<{ id?: number; url: string }>>([]);

  useEffect(() => {
    getAdminCategories().then((list) => {
      setCategories(list);
      if (!productId && list.length) {
        setForm((prev) => ({ ...prev, category_id: list[0].id }));
      }
    });
    if (productId) {
      getAdminProduct(productId)
        .then((item: AdminProduct) => {
          setForm({
            name: item.name,
            slug: item.slug,
            subtitle: item.subtitle,
            short_description: item.short_description,
            full_description: item.full_description,
            price: item.price,
            stock: item.stock,
            category_id: item.category_id,
            cover_image: item.cover_image,
            cover_media_id: item.cover_media_id,
            gallery_images: item.gallery_images.join("\n"),
            gallery_media_ids: item.gallery_media_ids || [],
            crystal_type: item.crystal_type,
            color: item.color,
            origin: item.origin,
            size: item.size,
            material: item.material,
            chakra: item.chakra,
            intention: item.intention,
            is_featured: item.is_featured,
            is_new: item.is_new,
            status: item.status,
          });
          setGalleryItems(
            item.gallery_image_assets?.length
              ? item.gallery_image_assets.map((media) => ({ id: media.id, url: media.url }))
              : item.gallery_images.map((url) => ({ url }))
          );
        })
        .finally(() => setLoading(false));
    }
  }, [productId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const parsedPrice = Number(form.price);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        throw new Error("价格格式不正确");
      }
      if (!Number.isInteger(form.stock) || form.stock < 0) {
        throw new Error("库存必须是非负整数");
      }
      if (!form.category_id) {
        throw new Error("请选择商品分类");
      }

      if (!form.cover_image.trim()) {
        throw new Error("请上传商品封面图");
      }
      const galleryImages = galleryItems.map((item) => item.url).filter(Boolean);
      const galleryMediaIds = Array.from(
        new Set(galleryItems.map((item) => item.id).filter((id): id is number => typeof id === "number" && Number.isInteger(id) && id > 0))
      );

      const payload: Partial<AdminProduct> = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        subtitle: form.subtitle.trim(),
        short_description: form.short_description.trim(),
        full_description: form.full_description.trim(),
        price: String(parsedPrice),
        stock: form.stock,
        category_id: form.category_id,
        cover_media_id: form.cover_media_id,
        gallery_media_ids: galleryMediaIds,
        cover_image: form.cover_image.trim(),
        gallery_images: galleryImages,
        crystal_type: form.crystal_type.trim(),
        color: form.color.trim(),
        origin: form.origin.trim(),
        size: form.size.trim(),
        material: form.material.trim(),
        chakra: form.chakra.trim(),
        intention: form.intention.trim(),
        is_featured: form.is_featured,
        is_new: form.is_new,
        status: form.status,
      };
      if (productId) {
        await updateAdminProduct(productId, payload);
      } else {
        await createAdminProduct(payload);
      }
      setMessage({ type: "success", text: "保存成功，正在返回列表..." });
      setTimeout(() => router.push("/admin/products"), 500);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setMessage({ type: "error", text: err.message });
      } else {
        setMessage({ type: "error", text: err instanceof Error ? err.message : "保存失败" });
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-stone-500">加载商品中...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 lg:grid-cols-2">
        <h3 className="lg:col-span-2 text-sm font-semibold text-stone-900">基础信息</h3>
        <label className="space-y-1 text-sm">
          <span className="text-stone-600">商品名称</span>
          <input className="w-full rounded-lg border border-stone-300 px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-stone-600">Slug</span>
          <input className="w-full rounded-lg border border-stone-300 px-3 py-2" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        </label>
        <label className="space-y-1 text-sm lg:col-span-2">
          <span className="text-stone-600">副标题</span>
          <input className="w-full rounded-lg border border-stone-300 px-3 py-2" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        </label>
      </section>

      <details className="rounded-2xl border border-stone-200 bg-white p-5" open>
        <summary className="cursor-pointer text-sm font-semibold text-stone-900">文案描述</summary>
        <div className="mt-3 grid gap-4">
          <textarea className="min-h-20 rounded-lg border border-stone-300 px-3 py-2 text-sm" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} placeholder="短描述" />
          <textarea className="min-h-44 rounded-lg border border-stone-300 px-3 py-2 text-sm" value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} placeholder="完整描述" />
        </div>
      </details>

      <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 lg:grid-cols-3">
        <h3 className="lg:col-span-3 text-sm font-semibold text-stone-900">销售与库存</h3>
        <label className="space-y-1 text-sm">
          <span className="text-stone-600">价格</span>
          <input type="number" step="0.01" className="w-full rounded-lg border border-stone-300 px-3 py-2" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-stone-600">库存</span>
          <input type="number" className="w-full rounded-lg border border-stone-300 px-3 py-2" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-stone-600">分类</span>
          <select className="w-full rounded-lg border border-stone-300 px-3 py-2" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })} required>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
      </section>

      <details className="rounded-2xl border border-stone-200 bg-white p-5">
        <summary className="cursor-pointer text-sm font-semibold text-stone-900">商品属性（可选）</summary>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          {(["crystal_type", "color", "origin", "size", "material", "chakra", "intention"] as const).map((field) => (
            <label key={field} className="space-y-1 text-sm">
              <span className="text-stone-600">{field}</span>
              <input className="h-11 w-full rounded-lg border border-stone-300 px-3 py-2" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
            </label>
          ))}
        </div>
      </details>

      <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-stone-900">图片</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <ImageUploadField
            label="封面图"
            value={form.cover_image}
            required
            onChange={(nextUrl, mediaId) => {
              setForm((prev) => ({ ...prev, cover_image: nextUrl, cover_media_id: mediaId }));
            }}
            hint="上传后会自动保存图片地址，无需手动填写 URL。"
          />
          <ImageUploadListField
            label="商品图集"
            values={galleryItems}
            onChange={(items) => {
              setGalleryItems(items);
              setForm((prev) => ({
                ...prev,
                gallery_images: items.map((item) => item.url).join("\n"),
                gallery_media_ids: items
                  .map((item) => item.id)
                  .filter((id): id is number => typeof id === "number" && Number.isInteger(id) && id > 0),
              }));
            }}
            hint="支持多张图片，已上传图片可删除或重新选择。"
          />
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 lg:grid-cols-3">
        <h3 className="lg:col-span-3 text-sm font-semibold text-stone-900">展示设置</h3>
        <label className="space-y-1 text-sm">
          <span className="text-stone-600">状态</span>
          <select className="w-full rounded-lg border border-stone-300 px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProductFormData["status"] })}>
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="archived">archived</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
          精选商品
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} />
          新品
        </label>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-stone-200 bg-white/95 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2 sm:bottom-4 sm:left-auto sm:right-6 sm:w-auto sm:rounded-xl sm:border sm:px-4 sm:pb-3 sm:pt-3 sm:shadow-soft">
        <div className="flex items-center gap-2 sm:gap-3">
          {message ? (
            <span className={`hidden text-sm sm:inline ${message.type === "success" ? "text-emerald-700" : "text-red-600"}`}>{message.text}</span>
          ) : null}
          <button type="button" onClick={() => router.back()} className="min-h-11 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 sm:flex-none">
            取消
          </button>
          <button type="submit" disabled={saving} className="min-h-11 flex-1 rounded-lg bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-60 sm:flex-none">
            {saving ? "保存中..." : "保存商品"}
          </button>
        </div>
      </div>
    </form>
  );
}
