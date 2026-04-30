"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminPageShell } from "@/components/admin/page-shell";
import { StatusPill } from "@/components/admin/status-pill";
import { getDashboardOverview } from "@/lib/admin-api";
import type { DashboardOverviewResponse } from "@/types/admin";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardOverview()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPageShell
      title="首页工作台"
      description="先看待办，再处理订单和商品。"
      actions={
        <div className="grid grid-cols-2 gap-2">
          <Link href="/admin/products/new" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-900 px-3 py-2 text-sm text-white">
            新增商品
          </Link>
          <Link href="/admin/orders" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700">
            查看订单
          </Link>
        </div>
      }
    >
      {loading ? <p className="text-sm text-stone-500">加载中...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {data ? (
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-r from-stone-900 to-stone-700 p-4 text-white">
            <p className="text-xs text-white/70">店铺状态</p>
            <p className="mt-1 text-lg font-semibold">营业中</p>
            <p className="mt-1 text-xs text-white/75">今天有 {data.stats[0]?.value ?? 0} 项关键任务待关注</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {data.stats.slice(0, 4).map((stat) => {
              const href =
                stat.label === "商品总数"
                  ? "/admin/products"
                  : stat.label === "已上架商品"
                    ? "/admin/products?status=active"
                    : stat.label === "草稿商品"
                      ? "/admin/products?status=draft"
                      : stat.label === "分类数"
                        ? "/admin/categories"
                        : "/admin";
              return (
                <Link key={stat.label} href={href} className="rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-stone-300 hover:bg-stone-50">
                <p className="text-xs text-stone-500">{stat.label}</p>
                <p className="mt-2 text-xl font-semibold text-stone-900">{stat.value}</p>
                <p className="mt-1 text-xs text-stone-500">点击查看详情</p>
                </Link>
              );
            })}
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-sm font-semibold text-stone-800">待办事项</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Link href="/admin/orders" className="rounded-xl bg-rose-50 px-3 py-3 text-rose-800">待处理订单</Link>
              <Link href="/admin/messages" className="rounded-xl bg-amber-50 px-3 py-3 text-amber-800">待回复留言</Link>
              <Link href="/admin/products" className="rounded-xl bg-sky-50 px-3 py-3 text-sky-800">待调整商品</Link>
              <Link href="/admin/settings" className="rounded-xl bg-stone-100 px-3 py-3 text-stone-800">店铺设置</Link>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-stone-800">最近商品</h3>
              <div className="mt-3 space-y-2">
                {data.recent_products.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-stone-100 px-3 py-2">
                    <Link href={`/admin/products/${item.id}`} className="text-sm text-stone-800 hover:text-stone-950">
                      {item.name}
                    </Link>
                    <StatusPill status={item.status} />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-stone-800">最新留言</h3>
              <div className="mt-3 space-y-2">
                {data.latest_messages.map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/messages?focus=${item.id}`}
                    className="block rounded-xl border border-stone-100 px-3 py-2 hover:bg-stone-50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-stone-800">{item.name}</p>
                      <span className={`text-xs ${item.is_read ? "text-stone-400" : "text-amber-600"}`}>
                        {item.is_read ? "已读" : "未读"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-stone-500">{item.subject}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
