"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { adminLogin } from "@/lib/admin-api";
import { setAdminAuth } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await adminLogin({ username, password });
      setAdminAuth(result.access_token, result.admin.email);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-6 sm:px-6">
      <div className="w-full rounded-3xl border border-stone-200 bg-white p-6 shadow-soft sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">LUMERA CRYSTAL</p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">商家端登录</h1>
        <p className="mt-2 text-sm text-stone-600">请输入你配置的商家账号与密码。</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-stone-700">用户名</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="请输入用户名"
              className="h-11 w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-stone-500"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-stone-700">密码</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="请输入密码"
              className="h-11 w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-stone-500"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-stone-900 px-4 py-2.5 text-sm text-white transition hover:bg-stone-700 disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录后台"}
          </button>
        </form>
      </div>
    </div>
  );
}
