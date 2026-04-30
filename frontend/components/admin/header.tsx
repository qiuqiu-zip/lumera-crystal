"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

import { clearAdminAuth, getAdminEmail } from "@/lib/admin-auth";
import { adminLogout } from "@/lib/admin-api";
import { adminNavItems } from "@/components/admin/nav-items";
import { cn } from "@/lib/utils";

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const adminEmail = getAdminEmail();
  const [menuOpen, setMenuOpen] = useState(false);
  const titleMap: Record<string, string> = {
    "/admin": "首页",
    "/admin/products": "商品",
    "/admin/orders": "订单",
    "/admin/categories": "分类",
    "/admin/posts": "内容",
    "/admin/messages": "留言",
    "/admin/newsletter": "订阅",
    "/admin/support-chat": "客服",
    "/admin/settings": "我的",
  };
  const currentTitle =
    titleMap[pathname || ""] ||
    (pathname?.startsWith("/admin/products/") ? "编辑商品" : pathname?.startsWith("/admin/posts/") ? "编辑内容" : pathname?.startsWith("/admin/categories/") ? "编辑分类" : "商家后台");
  const isDetailPage =
    pathname?.startsWith("/admin/products/") ||
    pathname?.startsWith("/admin/posts/") ||
    pathname?.startsWith("/admin/categories/");

  async function handleLogout() {
    try {
      await adminLogout();
    } catch {
      // ignore
    } finally {
      clearAdminAuth();
      router.replace("/admin/login");
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-14 items-center justify-between px-3 py-2 md:px-6">
        <div className="flex items-center gap-2">
          {isDetailPage ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-stone-300 text-stone-700 lg:hidden"
              aria-label="返回"
            >
              <ChevronLeft size={16} />
            </button>
          ) : null}
          <div>
            <p className="text-base font-semibold text-stone-900">{currentTitle}</p>
            <p className="text-[11px] text-stone-500">商家工作台</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex min-h-9 items-center rounded-full border border-stone-300 px-3 text-sm text-stone-700"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
            <span className="ml-1.5">更多</span>
          </button>
        </div>
      </div>
      <nav className={cn("border-t border-stone-200 bg-white px-3 pb-2 pt-2", menuOpen ? "block" : "hidden")}>
        <p className="mb-2 text-xs text-stone-500">{adminEmail ?? "Admin"}</p>
        <div className="space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center justify-between rounded-xl border border-stone-200 px-3 text-sm text-stone-700"
                onClick={() => setMenuOpen(false)}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon size={15} />
                  {item.label}
                </span>
                <ChevronRight size={14} className="text-stone-400" />
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-xl border border-red-200 text-sm text-red-600"
        >
          <LogOut size={14} />
          退出登录
        </button>
      </nav>
    </header>
  );
}
