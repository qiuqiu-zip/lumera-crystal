"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminPageShell } from "@/components/admin/page-shell";
import { getAdminOrder, getAdminOrders, updateAdminOrderStatus } from "@/lib/admin-api";
import type { AdminOrder, AdminOrderListResponse } from "@/types/admin";

type TabKey = "all" | "pending" | "processing" | "completed" | "cancelled";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待处理" },
  { key: "processing", label: "进行中" },
  { key: "completed", label: "已完成" },
  { key: "cancelled", label: "已取消" },
];

export default function AdminOrdersPage() {
  const [data, setData] = useState<AdminOrderListResponse | null>(null);
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [focusOrder, setFocusOrder] = useState<AdminOrder | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const result = await getAdminOrders({
      page,
      page_size: 20,
      tab,
      search: search || undefined,
    });
    setData((prev) => {
      if (page > 1 && prev) {
        return { ...result, items: [...prev.items, ...result.items] };
      }
      return result;
    });
  }, [page, search, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = useMemo(() => (data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1), [data]);

  async function openDetail(orderId: number) {
    const detail = await getAdminOrder(orderId);
    setFocusOrder(detail);
  }

  async function mutateStatus(status: "created" | "cancelled" | "fulfilled") {
    if (!focusOrder) return;
    setBusy(true);
    try {
      const updated = await updateAdminOrderStatus(focusOrder.id, status);
      setFocusOrder(updated);
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminPageShell title="订单工作流" description="按状态处理订单，重点动作放在底部。">
      <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-3">
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setTab(item.key);
                  if (page !== 1) setPage(1);
                  else load();
                }}
                className={`min-h-10 rounded-full px-3 text-sm ${tab === item.key ? "bg-stone-900 text-white" : "border border-stone-300 text-stone-700"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索订单号/用户" className="min-h-11 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          <button
            type="button"
            onClick={() => {
              if (page !== 1) setPage(1);
              else load();
            }}
            className="min-h-11 rounded-lg border border-stone-300 px-3 text-sm text-stone-700"
          >
            搜索
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {data?.items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-stone-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-stone-900">{item.order_no}</p>
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-700">{item.status}</span>
            </div>
            <p className="mt-1 text-xs text-stone-500">{new Date(item.created_at).toLocaleString()}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-stone-50 p-2 text-sm">
              <p className="text-stone-700">{item.user_name || "匿名用户"}</p>
              <p className="text-right font-medium text-stone-900">¥{item.total_amount}</p>
              <p className="text-xs text-stone-500">支付：{item.payment_status}</p>
              <p className="text-right text-xs text-stone-500">{item.items.length} 件商品</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => openDetail(item.id)} className="min-h-10 rounded-lg border border-stone-300 text-sm text-stone-700">
                查看详情
              </button>
              <button
                type="button"
                onClick={() => updateAdminOrderStatus(item.id, "fulfilled").then(load)}
                className="min-h-10 rounded-lg bg-stone-900 text-sm text-white disabled:bg-stone-300"
                disabled={item.status === "fulfilled" || item.status === "cancelled"}
              >
                标记完成
              </button>
            </div>
          </article>
        ))}
        {data?.items.length === 0 ? <p className="rounded-2xl border border-stone-200 bg-white px-4 py-8 text-center text-sm text-stone-500">暂无订单</p> : null}
      </div>

      {page < totalPages ? (
        <button
          type="button"
          onClick={() => setPage((v) => v + 1)}
          className="min-h-11 w-full rounded-xl border border-stone-300 bg-white text-sm text-stone-700"
        >
          加载更多订单
        </button>
      ) : null}

      {focusOrder ? (
        <div className="fixed inset-0 z-40 bg-black/40 p-3" onClick={() => setFocusOrder(null)}>
          <div className="mx-auto mt-8 max-h-[84vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-4" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-stone-900">订单详情</h3>
              <button type="button" onClick={() => setFocusOrder(null)} className="rounded-lg border border-stone-300 px-2 py-1 text-xs">关闭</button>
            </div>
            <div className="mt-3 space-y-3 text-sm">
              <section className="rounded-xl border border-stone-200 p-3">
                <p className="text-xs text-stone-500">状态</p>
                <p className="mt-1 font-medium">{focusOrder.status} / 支付 {focusOrder.payment_status}</p>
              </section>
              <section className="rounded-xl border border-stone-200 p-3">
                <p className="text-xs text-stone-500">用户信息</p>
                <p className="mt-1">{focusOrder.user_name || "匿名用户"} · {focusOrder.user_email || "-"}</p>
              </section>
              <section className="rounded-xl border border-stone-200 p-3">
                <p className="text-xs text-stone-500">商品信息</p>
                <div className="mt-2 space-y-1">
                  {focusOrder.items.map((line) => (
                    <p key={line.id} className="text-sm">商品#{line.product_id} × {line.quantity} · ¥{line.line_total}</p>
                  ))}
                </div>
              </section>
              <section className="rounded-xl border border-stone-200 p-3">
                <p className="text-xs text-stone-500">金额信息</p>
                <p className="mt-1 font-medium">总额 ¥{focusOrder.total_amount}</p>
              </section>
              <section className="rounded-xl border border-stone-200 p-3">
                <p className="text-xs text-stone-500">收货信息</p>
                <p className="mt-1">{focusOrder.shipping_address}</p>
              </section>
            </div>
            <div className="sticky bottom-0 mt-4 grid grid-cols-3 gap-2 bg-white pb-[calc(0.3rem+env(safe-area-inset-bottom))] pt-2">
              <button type="button" onClick={() => mutateStatus("created")} className="min-h-11 rounded-lg border border-stone-300 text-sm">恢复</button>
              <button type="button" onClick={() => mutateStatus("cancelled")} className="min-h-11 rounded-lg border border-red-200 text-sm text-red-600">取消</button>
              <button type="button" onClick={() => mutateStatus("fulfilled")} className="min-h-11 rounded-lg bg-stone-900 text-sm text-white" disabled={busy}>完成</button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
