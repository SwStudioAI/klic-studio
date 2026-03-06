"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getRefreshToken, clearTokens } from "@/lib/auth";
import { api } from "@/lib/api";
import { useMe } from "@/hooks/useMe";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Film,
  FolderOpen,
  Clapperboard,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { href: "/studio", label: "Projects", icon: FolderOpen, exact: true },
  { href: "/studio", label: "Renders", icon: Clapperboard, exact: false, disabled: true },
  { href: "/studio", label: "Settings", icon: Settings, exact: false, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useMe();

  const handleLogout = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await api.post("/auth/logout", { refresh_token: refreshToken });
      } catch {
        // proceed with local cleanup even if server logout fails
      }
    }
    clearTokens();
    router.push("/login");
  };

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2 px-4 border-b">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <Link href="/studio" className="flex items-center gap-2 font-bold">
          <Film className="h-5 w-5" />
          kLic Studio
        </Link>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive && !item.disabled
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />
      <div className="p-3">
        {user && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <Avatar className="h-7 w-7">
              <AvatarImage src={user.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">
                {user.display_name?.charAt(0).toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium truncate">
              {user.display_name}
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
