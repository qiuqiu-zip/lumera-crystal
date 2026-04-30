"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminPageShell } from "@/components/admin/page-shell";
import { getAdminNewsletter } from "@/lib/admin-api";
import type { AdminNewsletterListResponse } from "@/types/admin";

export default function AdminNewsletterPage() {
  const [data, setData] = useState<AdminNewsletterListResponse | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const result = await getAdminNewsletter({
      page,
      page_size: 30,
      search: search || undefined,
    });
    setData(result);
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <AdminPageShell title="Newsletter 订阅" description="查看订阅邮箱，后续可扩展导出能力。">
      <div className="grid gap-2 sm:flex">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索邮箱" className="min-h-11 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm sm:w-64" />
        <button
          type="button"
          onClick={() => {
            if (page === 1) load();
            else setPage(1);
          }}
          className="min-h-11 rounded-lg border border-stone-300 px-3 py-2 text-sm"
        >
          搜索
        </button>
      </div>
      <div className="hidden overflow-hidden rounded-2xl border border-stone-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-stone-600">
            <tr>
              <th className="px-3 py-3">邮箱</th>
              <th className="px-3 py-3">来源</th>
              <th className="px-3 py-3">订阅时间</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((item) => (
              <tr key={item.id} className="border-t border-stone-100">
                <td className="px-3 py-3">{item.email}</td>
                <td className="px-3 py-3 text-stone-600">{item.source}</td>
                <td className="px-3 py-3 text-xs text-stone-500">{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.items.length === 0 ? <p className="px-4 py-8 text-center text-sm text-stone-500">暂无订阅数据</p> : null}
      </div>
      <div className="space-y-2 md:hidden">
        {data?.items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-stone-200 bg-white p-3">
            <p className="text-sm font-medium text-stone-800">{item.email}</p>
            <p className="mt-1 text-xs text-stone-600">来源：{item.source}</p>
            <p className="mt-1 text-xs text-stone-500">{new Date(item.created_at).toLocaleString()}</p>
          </article>
        ))}
        {data?.items.length === 0 ? <p className="rounded-2xl border border-stone-200 bg-white px-4 py-8 text-center text-sm text-stone-500">暂无订阅数据</p> : null}
      </div>
      <div className="flex items-center justify-end gap-2">
        <button disabled={page <= 1} onClick={() => setPage((v) => v - 1)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm disabled:opacity-40">
          上一页
        </button>
        <span className="text-sm text-stone-600">{page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((v) => v + 1)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm disabled:opacity-40">
          下一页
        </button>
      </div>
    </AdminPageShell>
  );
}
