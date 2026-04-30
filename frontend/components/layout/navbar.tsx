"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CART_UPDATED_EVENT, getCart } from "@/lib/cart";

export function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { href: "/", label: "首页" },
    { href: "/products", label: "晶石商店" },
    { href: "/cart", label: "购物车" },
    { href: "/shop", label: "订单" },
    { href: "/categories/amethyst", label: "分类" },
    { href: "/blog", label: "灵感日志" },
    { href: "/about", label: "品牌" },
    { href: "/contact", label: "联系" }
  ];

  useEffect(() => {
    const syncCount = () => {
      const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    };

    syncCount();
    window.addEventListener("storage", syncCount);
    window.addEventListener(CART_UPDATED_EVENT, syncCount);
    return () => {
      window.removeEventListener("storage", syncCount);
      window.removeEventListener(CART_UPDATED_EVENT, syncCount);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-mist/50 bg-ivory/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-3 sm:px-4 md:px-8">
        <Link href="/" className="font-serif text-base tracking-[0.15em] text-ink sm:text-xl sm:tracking-[0.2em]">
          LUMERA CRYSTAL
        </Link>
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/admin/login" className="text-[11px] text-ink/45">
            后台
          </Link>
          <div className="relative">
            <Link href="/cart" className="inline-flex min-h-10 items-center rounded-lg px-2 text-sm text-ink/85">
              购物车
            </Link>
            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-1 rounded-full bg-ink px-1.5 py-0.5 text-[10px] leading-none text-ivory">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            className="inline-flex min-h-10 items-center rounded-lg border border-mist px-3 text-sm text-ink"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? "关闭" : "菜单"}
          </button>
        </div>
        <nav className="hidden gap-6 text-sm text-ink/80 md:flex">
          {links.map((item) => (
            <div key={item.href} className="relative">
              <Link href={item.href} className="hover:text-ink">
                {item.label}
              </Link>
              {item.href === "/cart" && cartCount > 0 ? (
                <span className="absolute -right-4 -top-2 rounded-full bg-ink px-1.5 py-0.5 text-[10px] leading-none text-ivory">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </div>
          ))}
        </nav>
        <Link href="/admin/login" className="ml-3 hidden text-xs text-ink/35 hover:text-ink/55 md:inline-flex">
          工作台
        </Link>
      </div>
      {menuOpen ? (
        <div className="border-t border-mist/60 bg-ivory/95 px-3 py-3 md:hidden">
          <nav className="grid grid-cols-2 gap-2 text-sm">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-mist/70 bg-white/70 px-3 py-2.5 text-center text-ink/85"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
