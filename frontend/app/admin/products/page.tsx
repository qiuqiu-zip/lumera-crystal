"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { MobileFilterDrawer } from "@/components/admin/mobile-filter-drawer";
import { AdminPageShell } from "@/components/admin/page-shell";
import { StatusPill } from "@/components/admin/status-pill";
import { bulkStatusAdminProduct, deleteAdminProduct, getAdminCategories, getAdminProducts } from "@/lib/admin-api";
import type { AdminCategory, AdminProduct, AdminProductListResponse } from "@/types/admin";

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";
  const initialSearch = searchParams.get("search") || "";
  const [data, setData] = useState<AdminProductListResponse | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [categoryId, setCategoryId] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [batchMode, setBatchMode] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 12;

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await getAdminProducts({
        page,
        page_size: pageSize,
        search: search || undefined,
        status: status || undefined,
        category_id: categoryId || undefined,
      });
      setData((prev) => {
        if (page > 1 && prev) {
          return { ...result, items: [...prev.items, ...result.items] };
        }
        return result;
      });
      if (page === 1) setSelectedIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, [categoryId, page, search, status]);

  useEffect(() => {
    getAdminCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const nextStatus = searchParams.get("status") || "";
    const nextSearch = searchParams.get("search") || "";
    setStatus(nextStatus);
    setSearch(nextSearch);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: number) {
    if (!confirm("确认删除该商品？")) return;
    await deleteAdminProduct(id);
    await load();
  }

  async function handleBulkActive() {
    if (!selectedIds.length) return;
    await bulkStatusAdminProduct(selectedIds, "active");
    setBatchMode(false);
    await load();
  }

  async function handleBulkArchive() {
    if (!selectedIds.length) return;
    await bulkStatusAdminProduct(selectedIds, "archived");
    setBatchMode(false);
    await load();
  }

  function toggleItem(item: AdminProduct) {
    setSelectedIds((prev) => (prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]));
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <AdminPageShell
      title="商品管理"
      description="先新增，再管理在售商品。"
      actions={
        <Link href="/admin/products/new" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-stone-900 px-3 py-2 text-sm font-medium text-white">
          新增商品
        </Link>
      }
    >
      <div className="rounded-2xl border border-stone-200 bg-white p-4">
        <div className="flex gap-2 md:hidden">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索商品" className="min-h-11 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          <button type="button" onClick={() => setMobileFilterOpen(true)} className="min-h-11 rounded-lg border border-stone-300 px-3 text-sm text-stone-700">
            筛选
          </button>
        </div>
        <div className="mt-0 hidden gap-3 md:grid lg:grid-cols-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索名称/slug" className="min-h-11 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-11 rounded-lg border border-stone-300 px-3 py-2 text-sm">
            <option value="">全部状态</option>
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="archived">archived</option>
          </select>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="min-h-11 rounded-lg border border-stone-300 px-3 py-2 text-sm">
            <option value="">全部分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              if (page === 1) load();
              else setPage(1);
            }}
            className="min-h-11 rounded-lg bg-stone-900 px-3 py-2 text-sm text-white"
          >
            筛选
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs text-stone-500">共 {data?.total ?? 0} 件商品</p>
          <button
            type="button"
            onClick={() => {
              setBatchMode((prev) => !prev);
              setSelectedIds([]);
            }}
            className="min-h-10 rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700"
          >
            {batchMode ? "退出批量" : "批量管理"}
          </button>
        </div>
        {batchMode ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button type="button" onClick={handleBulkActive} className="min-h-10 rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700">
              批量上架
            </button>
            <button type="button" onClick={handleBulkArchive} className="min-h-10 rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700">
              批量归档
            </button>
          </div>
        ) : null}
      </div>
      <MobileFilterDrawer
        open={mobileFilterOpen}
        title="筛选商品"
        onClose={() => setMobileFilterOpen(false)}
        onReset={() => {
          setStatus("");
          setCategoryId("");
          setMobileFilterOpen(false);
          if (page === 1) load();
          else setPage(1);
        }}
        onApply={() => {
          setMobileFilterOpen(false);
          if (page === 1) load();
          else setPage(1);
        }}
      >
        <label className="block space-y-1 text-sm">
          <span className="text-stone-600">状态</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-11 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm">
            <option value="">全部状态</option>
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="archived">archived</option>
          </select>
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-stone-600">分类</span>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="min-h-11 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm">
            <option value="">全部分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
      </MobileFilterDrawer>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="hidden overflow-hidden rounded-2xl border border-stone-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-stone-600">
            <tr>
              <th className="px-3 py-3">#</th>
              <th className="px-3 py-3">商品</th>
              <th className="px-3 py-3">价格</th>
              <th className="px-3 py-3">库存</th>
              <th className="px-3 py-3">状态</th>
              <th className="px-3 py-3">更新时间</th>
              <th className="px-3 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((item) => (
              <tr key={item.id} className="border-t border-stone-100">
                <td className="px-3 py-3">{batchMode ? <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleItem(item)} /> : null}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    {item.cover_image_asset?.media_kind === "video" ? (
                      <video
                        src={item.cover_image || "https://placehold.co/80x80"}
                        className="h-10 w-10 rounded-md object-cover"
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img src={item.cover_image || "https://placehold.co/80x80"} alt={item.name} className="h-10 w-10 rounded-md object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-stone-800">{item.name}</p>
                      <p className="text-xs text-stone-500">{item.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">¥{item.price}</td>
                <td className="px-3 py-3">{item.stock}</td>
                <td className="px-3 py-3"><StatusPill status={item.status} /></td>
                <td className="px-3 py-3 text-xs text-stone-500">{new Date(item.updated_at).toLocaleString()}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${item.id}`} className="text-stone-700 hover:text-stone-900">编辑</Link>
                    <button type="button" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700">
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.items.length === 0 ? <p className="px-4 py-8 text-center text-sm text-stone-500">暂无商品</p> : null}
      </div>
      <div className="space-y-3 md:hidden">
        {data?.items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-stone-200 bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              {batchMode ? (
                <label className="inline-flex items-center gap-2 text-xs text-stone-500">
                  <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleItem(item)} />
                  选择
                </label>
              ) : (
                <p className="text-xs text-stone-500">商品编号 #{item.id}</p>
              )}
              <StatusPill status={item.status} />
            </div>
            <div className="mt-2 flex items-center gap-3">
              {item.cover_image_asset?.media_kind === "video" ? (
                <video src={item.cover_image || "https://placehold.co/80x80"} className="h-14 w-14 rounded-md object-cover" muted loop playsInline />
              ) : (
                <img src={item.cover_image || "https://placehold.co/80x80"} alt={item.name} className="h-14 w-14 rounded-md object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-800">{item.name}</p>
                <p className="truncate text-xs text-stone-500">{item.slug}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-stone-50 p-2 text-xs text-stone-600">
              <p>价格 ¥{item.price}</p>
              <p>库存 {item.stock}</p>
              <p>{new Date(item.updated_at).toLocaleDateString()}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href={`/admin/products/${item.id}`} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-stone-300 text-sm text-stone-700">编辑</Link>
              <details className="relative">
                <summary className="flex min-h-10 cursor-pointer list-none items-center justify-center rounded-lg border border-stone-300 text-sm text-stone-700">
                  <MoreHorizontal size={16} />
                  <span className="ml-1">更多</span>
                </summary>
                <div className="absolute right-0 top-11 z-10 w-28 rounded-xl border border-stone-200 bg-white p-1 shadow-lg">
                  <button type="button" onClick={() => handleDelete(item.id)} className="w-full rounded-lg px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                    删除
                  </button>
                </div>
              </details>
            </div>
          </article>
        ))}
        {data?.items.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-4 py-10 text-center">
            <p className="text-base font-medium text-stone-900">暂无商品</p>
            <p className="mt-1 text-sm text-stone-500">你还没有创建商品，先新增一个商品开始管理。</p>
            <Link href="/admin/products/new" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-4 text-sm text-white">
              立即新增商品
            </Link>
          </div>
        ) : null}
      </div>
      {page < totalPages ? (
        <button
          type="button"
          onClick={() => setPage((v) => v + 1)}
          className="min-h-11 w-full rounded-xl border border-stone-300 bg-white text-sm text-stone-700"
        >
          加载更多商品
        </button>
      ) : null}
    </AdminPageShell>
  );
}
