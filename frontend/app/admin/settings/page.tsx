import { AdminPageShell } from "@/components/admin/page-shell";
import Link from "next/link";

export default function AdminSettingsPage() {
  return (
    <AdminPageShell title="我的" description="账号、店铺、通知与帮助入口。">
      <div className="space-y-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-sm font-semibold text-stone-900">店铺信息</p>
          <p className="mt-1 text-xs text-stone-500">营业状态、品牌资料、基础配置</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/admin/settings" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-stone-300 text-sm text-stone-700">营业设置</Link>
            <Link href="/admin/settings" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-stone-300 text-sm text-stone-700">店铺资料</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-sm font-semibold text-stone-900">常用入口</p>
          <div className="mt-3 space-y-2 text-sm">
            <Link href="/admin/messages" className="block rounded-xl border border-stone-200 px-3 py-3 text-stone-700">消息通知与待回复</Link>
            <Link href="/admin/support-chat" className="block rounded-xl border border-stone-200 px-3 py-3 text-stone-700">客服工作台</Link>
            <Link href="/admin/newsletter" className="block rounded-xl border border-stone-200 px-3 py-3 text-stone-700">订阅管理</Link>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
