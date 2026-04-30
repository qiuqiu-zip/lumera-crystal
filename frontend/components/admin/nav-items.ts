import { Blocks, FileText, Gem, LayoutDashboard, Mail, MessageCircle, Send, Settings } from "lucide-react";
import { ClipboardList } from "lucide-react";

export const adminNavItems = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/orders", label: "订单", icon: ClipboardList },
  { href: "/admin/products", label: "商品", icon: Gem },
  { href: "/admin/categories", label: "分类", icon: Blocks },
  { href: "/admin/posts", label: "博客", icon: FileText },
  { href: "/admin/messages", label: "留言", icon: Mail },
  { href: "/admin/support-chat", label: "客服", icon: MessageCircle },
  { href: "/admin/newsletter", label: "订阅", icon: Send },
  { href: "/admin/settings", label: "我的", icon: Settings },
] as const;
